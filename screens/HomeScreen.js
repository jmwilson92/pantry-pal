import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, Dimensions, Image, Animated, TouchableWithoutFeedback, StatusBar } from 'react-native';
import { loadItems } from '../utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Separate Animated Tile Component
const AnimatedTile = ({ item, urgency, getDaysLeftText, getPlaceholderImage }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.03,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.itemCard, { 
      shadowColor: urgency,
      transform: [{ scale: scaleAnim }] 
    }]}>
      <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
        <View style={styles.roundedWrapper}>
          <Image 
            source={{ uri: getPlaceholderImage() }} 
            style={styles.foodImage} 
          />
          <View style={styles.infoOverlay}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemDays}>{getDaysLeftText(item)}</Text>
            <Text style={styles.itemExpiry}>Expiry: {item.expiry || 'No date'}</Text>
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
    setShowFilterModal(false);
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
      <StatusBar barStyle="dark-content" backgroundColor="#f8f1e9" />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pantry Pal 🥬</Text>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => navigation.navigate('Scan')}
        >
          <Text style={styles.scanButtonText}>𝄃𝄃𝄂𝄂𝄀𝄁𝄃𝄂𝄂𝄃</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.stats}>You have {items.length} items • {filteredItems.length} shown</Text>

      {/* Single Filter Button */}
      <View style={styles.filterRow}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterButtonText}>Filter: {activeFilter} • {sortBy === 'expiry' ? 'Expiry' : 'A-Z'}</Text>
        </TouchableOpacity>
      </View>

      {/* Full Width Single Column Grid */}
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

      {/* Combined Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>

            <Text style={styles.modalSection}>Sort</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => changeSort('expiry')}>
              <Text style={styles.modalOptionText}>Expiry (Soonest First)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => changeSort('name')}>
              <Text style={styles.modalOptionText}>A-Z</Text>
            </TouchableOpacity>

            <Text style={styles.modalSection}>Category</Text>
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
  container: { flex: 1, backgroundColor: '#f8f1e9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3f2a1d' },
  scanButton: { backgroundColor: '#e8d9c2', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  scanButtonText: { fontSize: 22 },
  stats: { paddingHorizontal: 20, color: '#6b5b4f', marginBottom: 12 },
  filterRow: { paddingHorizontal: 16, marginBottom: 12 },
  filterButton: { backgroundColor: '#e8d9c2', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, alignSelf: 'flex-start' },
  filterButtonText: { fontWeight: '600', color: '#3f2a1d', fontSize: 15 },
  gridContainer: { 
    paddingHorizontal: 12,
    paddingBottom: 40,
    gap: 12,
  },
  itemCard: { 
    width: '100%',
    alignItems: 'center',
  },
  roundedWrapper: { 
    width: '100%',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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
    backgroundColor: 'rgba(63, 42, 29, 0.85)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  itemName: { fontSize: 15, fontWeight: '700', color: '#fff', textAlign: 'center' },
  itemDays: { fontSize: 13, fontWeight: '800', color: '#4ade80' },
  itemExpiry: { fontSize: 12, color: '#d1c5b5', marginTop: 2 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 22, fontWeight: '600', color: '#6b5b4f' },
  emptySubtext: { fontSize: 16, color: '#8a7a6b', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(63, 42, 29, 0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '85%', maxWidth: 320 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#3f2a1d' },
  modalSection: { fontSize: 14, fontWeight: '700', color: '#6b5b4f', marginTop: 12, marginBottom: 6, paddingHorizontal: 4 },
  modalOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0e6d9' },
  modalOptionActive: { backgroundColor: '#f0e6d9' },
  modalOptionText: { fontSize: 17, textAlign: 'center', color: '#3f2a1d' },
  modalOptionTextActive: { color: '#22c55e', fontWeight: '600' },
  modalClose: { marginTop: 16, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 30 },
  modalCloseText: { color: '#6b5b4f', fontWeight: '600' },
});