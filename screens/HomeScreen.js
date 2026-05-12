import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, Dimensions, Image, StatusBar } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { loadItems, markAsUsed, deleteItem } from '../utils/firestoreStorage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
        if (!a.expiry || a.expiry === 'NA') return 1;
        if (!b.expiry || b.expiry === 'NA') return -1;
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

  const handleMarkAsUsed = async (id) => {
    await markAsUsed(id);
    loadData();
  };

  const handleDelete = async (id) => {
    await deleteItem(id);
    loadData();
  };

  const renderRightActions = (progress, dragX, item) => {
    return (
      <TouchableOpacity 
        style={styles.deleteAction}
        onPress={() => handleDelete(item.id)}
      >
        <Text style={styles.actionEmoji}>🗑️</Text>
        <Text style={styles.actionLabel}>Compost</Text>
      </TouchableOpacity>
    );
  };

  const renderLeftActions = (progress, dragX, item) => {
    return (
      <TouchableOpacity 
        style={styles.consumeAction}
        onPress={() => handleMarkAsUsed(item.id)}
      >
        <Text style={styles.actionEmoji}>🍽️</Text>
        <Text style={styles.actionLabel}>Eat</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = (item) => {
    const urgency = getUrgencyColor(item);
    const displayImage = item.photoUri || getPlaceholderImage();

    return (
      <Swipeable
        key={item.id}
        renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, item)}
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
        overshootLeft={false}
        overshootRight={false}
      >
        <View style={[styles.itemCard, { shadowColor: urgency }]}>
          <View style={styles.roundedWrapper}>
            <Image 
              source={{ uri: displayImage }} 
              style={styles.foodImage} 
            />
            <View style={styles.infoOverlay}>
              <View style={styles.nameRow}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                {(item.quantity || 1) > 1 && (
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>x{item.quantity}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.itemDays}>{getDaysLeftText(item)}</Text>
              <Text style={styles.itemExpiry}>Expiry: {item.expiry || 'No date'}</Text>
            </View>
          </View>
        </View>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f1e9" />
      <View style={styles.header}>
        <Text style={styles.title}>Pantry Pal 🥦</Text>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => navigation.navigate('Scan')}
        >
          <Text style={styles.scanButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.stats}>You have {items.length} items • {filteredItems.length} shown</Text>

      <View style={styles.filterRow}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterButtonText}>Filter: {activeFilter} • {sortBy === 'expiry' ? 'Expiry' : 'A-Z'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Your pantry is empty</Text>
            <Text style={styles.emptySubtext}>Scan items to get started!</Text>
          </View>
        ) : (
          filteredItems.map(item => renderItem(item))
        )}
      </ScrollView>

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
  scanButton: { backgroundColor: '#e8d9c2', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  scanButtonText: { fontSize: 20 },
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
    marginBottom: 12,
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
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemName: { fontSize: 15, fontWeight: '700', color: '#fff', flex: 1 },
  quantityBadge: { 
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  quantityText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  itemDays: { fontSize: 13, fontWeight: '800', color: '#4ade80' },
  itemExpiry: { fontSize: 12, color: '#d1c5b5', marginTop: 2 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 22, fontWeight: '600', color: '#6b5b4f' },
  emptySubtext: { fontSize: 16, color: '#8a7a6b', marginTop: 8 },
  consumeAction: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    paddingVertical: 8,
  },
  deleteAction: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    paddingVertical: 8,
  },
  actionEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  actionLabel: {
    color: '#000',
    fontWeight: '600',
    fontSize: 12,
  },
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