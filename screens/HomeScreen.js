import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, Dimensions, Image, Animated, TouchableWithoutFeedback } from 'react-native';
import { loadItems } from '../utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Separate Animated Tile Component
const AnimatedTile = ({ item, urgency, getDaysLeftText, getPlaceholderImage }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.itemCard, { 
      shadowColor: urgency,
      transform: [{ scale: scaleAnim }] 
    }]}>
      <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
        <View style={styles.circleWrapper}>
          <Image 
            source={{ uri: getPlaceholderImage() }} 
            style={styles.foodImage} 
          />
          <View style={styles.infoOverlay}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemDays}>{getDaysLeftText(item)}</Text>
            <Text style={styles.itemExpiry}>{item.expiry || 'No date'}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('expiry');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const filters = ['All', 'Dairy', 'Fruit', 'Vegetable', 'Meat', 'Other'];

  const loadData = async () => {
    const loadedItems = await loadItems();
    setItems(loadedItems);
    applyFiltersAndSort(loadedItems, activeFilter, sortBy);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const applyFiltersAndSort = (itemList, filter, sortMode) => {
    let result = [...itemList];

    if (filter !== 'All') {
      result = result.filter(item => {
        const name = item.name.toLowerCase();
        if (filter === 'Dairy') return name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || name.includes('butter');
        if (filter === 'Fruit') return name.includes('apple') || name.includes('banana') || name.includes('orange') || name.includes('berry');
        if (filter === 'Vegetable') return name.includes('carrot') || name.includes('lettuce') || name.includes('tomato') || name.includes('potato');
        if (filter === 'Meat') return name.includes('chicken') || name.includes('beef') || name.includes('pork') || name.includes('fish');
        return true;
      });
    }

    if (sortMode === 'expiry') {
      result.sort((a, b) => {
        if (a.expiry === 'NA') return 1;
        if (b.expiry === 'NA') return -1;
        return new Date(a.expiry) - new Date(b.expiry);
      });
    } else if (sortMode === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredItems(result);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const changeFilter = (filter) => {
    setActiveFilter(filter);
    applyFiltersAndSort(items, filter, sortBy);
    setShowFilterModal(false);
  };

  const changeSort = (mode) => {
    setSortBy(mode);
    applyFiltersAndSort(items, activeFilter, mode);
  };

  const getUrgencyColor = (item) => {
    if (!item.expiry || item.expiry === 'NA') return '#22c55e';
    const daysLeft = Math.ceil((new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 2) return '#ef4444';
    if (daysLeft <= 7) return '#eab308';
    return '#22c55e';
  };

  const getDaysLeftText = (item) => {
    if (!item.expiry || item.expiry === 'NA') return 'No expiry';
    const daysLeft = Math.ceil((new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return 'Expired!';
    if (daysLeft === 0) return 'Today';
    return `${daysLeft}d`;
  };

  const getPlaceholderImage = () => 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pantry Pal 🥬</Text>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => navigation.navigate('Scan')}
        >
          <Text style={styles.scanButtonText}>+ Scan</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.stats}>You have {items.length} items • {filteredItems.length} shown</Text>

      {/* Sort + Filter Row */}
      <View style={styles.sortFilterRow}>
        <View style={styles.sortButtons}>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'expiry' && styles.sortButtonActive]}
            onPress={() => changeSort('expiry')}
          >
            <Text style={styles.sortText}>Expiry ↑</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
            onPress={() => changeSort('name')}
          >
            <Text style={styles.sortText}>A-Z</Text>
        </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterButtonText}>Filter: {activeFilter}</Text>
        </TouchableOpacity>
      </View>

      {/* Circle Grid with Scale Animation */}
      <ScrollView 
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {filteredItems.map((item, index) => {
          const urgency = getUrgencyColor(item);
          return (
            <AnimatedTile 
              key={item.id}
              item={item}
              urgency={urgency}
              getDaysLeftText={getDaysLeftText}
              getPlaceholderImage={getPlaceholderImage}
            />
          );
        })}
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Category</Text>
            {filters.map(filter => (
              <TouchableOpacity
                key={filter}
                style={[styles.modalOption, activeFilter === filter && styles.modalOptionActive]}
                onPress={() => changeFilter(filter)}
              >
                <Text style={[styles.modalOptionText, activeFilter === filter && styles.modalOptionTextActive]}>{filter}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowFilterModal(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  scanButton: { backgroundColor: '#22c55e', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  scanButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  stats: { paddingHorizontal: 20, color: '#94a3b8', marginBottom: 12 },
  sortFilterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sortButtons: { flexDirection: 'row', gap: 8 },
  sortButton: { backgroundColor: '#334155', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  sortButtonActive: { backgroundColor: '#22c55e' },
  sortText: { fontWeight: '600', color: '#e2e8f0' },
  filterButton: { backgroundColor: '#334155', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  filterButtonText: { fontWeight: '600', color: '#e2e8f0' },
  gridContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    paddingBottom: 40,
    gap: 10,
  },
  itemCard: { 
    width: 210,
    alignItems: 'center',
  },
  circleWrapper: { 
    width: 200,
    height: 200,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  foodImage: { 
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoOverlay: { 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  itemName: { fontSize: 13, fontWeight: '700', color: '#fff', textAlign: 'center' },
  itemDays: { fontSize: 12, fontWeight: '800', color: '#4ade80' },
  itemExpiry: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 22, fontWeight: '600', color: '#64748b' },
  emptySubtext: { fontSize: 16, color: '#475569', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, width: '85%', maxWidth: 320 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#f8fafc' },
  modalOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#334155' },
  modalOptionActive: { backgroundColor: '#166534' },
  modalOptionText: { fontSize: 17, textAlign: 'center', color: '#e2e8f0' },
  modalOptionTextActive: { color: '#4ade80', fontWeight: '600' },
  modalClose: { marginTop: 16, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 30 },
  modalCloseText: { color: '#94a3b8', fontWeight: '600' },
});