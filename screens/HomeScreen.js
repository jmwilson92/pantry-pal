import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { loadItems } from '../utils/storage';

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
    if (!item.expiry || item.expiry === 'NA') return '#4ade80';
    const daysLeft = Math.ceil((new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 2) return '#ef4444';
    if (daysLeft <= 7) return '#fbbf24';
    return '#4ade80';
  };

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

      {/* Inventory List */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={[styles.itemCard, { borderLeftColor: getUrgencyColor(item) }]}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemExpiry}>{item.expiry || 'No expiry'}</Text>
            </View>
            <Text style={styles.itemBarcode}>Barcode: {item.barcode}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No items yet</Text>
            <Text style={styles.emptySubtext}>Scan something to get started!</Text>
          </View>
        }
      />

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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
  scanButton: { backgroundColor: '#00ff9f', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  scanButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  stats: { paddingHorizontal: 20, color: '#64748b', marginBottom: 12 },
  sortFilterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sortButtons: { flexDirection: 'row', gap: 8 },
  sortButton: { backgroundColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  sortButtonActive: { backgroundColor: '#00ff9f' },
  sortText: { fontWeight: '600', color: '#475569' },
  filterButton: { backgroundColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  filterButtonText: { fontWeight: '600', color: '#475569' },
  itemCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, padding: 16, borderRadius: 16, borderLeftWidth: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  itemExpiry: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  itemBarcode: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 20, fontWeight: '600', color: '#64748b' },
  emptySubtext: { fontSize: 16, color: '#94a3b8', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '85%', maxWidth: 320 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  modalOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalOptionActive: { backgroundColor: '#f0fdf4' },
  modalOptionText: { fontSize: 17, textAlign: 'center' },
  modalOptionTextActive: { color: '#16a34a', fontWeight: '600' },
  modalClose: { marginTop: 16, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 30 },
  modalCloseText: { color: '#64748b', fontWeight: '600' },
});