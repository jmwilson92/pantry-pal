import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, Dimensions } from 'react-native';
import { loadItems } from '../utils/storage';
import Svg, { Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 32) / 2;

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

  const getCategoryEmoji = (name) => {
    const n = name.toLowerCase();
    if (n.includes('milk') || n.includes('cheese') || n.includes('yogurt') || n.includes('butter')) return '🥛';
    if (n.includes('apple') || n.includes('banana') || n.includes('orange') || n.includes('berry')) return '🍎';
    if (n.includes('carrot') || n.includes('lettuce') || n.includes('tomato') || n.includes('potato')) return '🥕';
    if (n.includes('chicken') || n.includes('beef') || n.includes('pork') || n.includes('fish')) return '🍗';
    return '🛒';
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

  const hexPoints = '50,5 95,25 95,75 50,95 5,75 5,25';

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

      {/* Hex Grid - Tight + Clean */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const urgency = getUrgencyColor(item);
          return (
            <View style={styles.itemCard}>
              <View style={styles.hexWrapper}>
                <Svg width={108} height={108} viewBox="0 0 100 100">
                  <Defs>
                    <LinearGradient id="leftGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor={urgency} stopOpacity="0.9" />
                      <Stop offset="35%" stopColor="#1e293b" stopOpacity="1" />
                    </LinearGradient>
                  </Defs>
                  <Polygon
                    points={hexPoints}
                    fill="url(#leftGradient)"
                    stroke="#334155"
                    strokeWidth="3"
                  />
                </Svg>
                <View style={styles.emojiContainer}>
                  <Text style={styles.emoji}>{getCategoryEmoji(item.name)}</Text>
                </View>
              </View>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.itemDays}>{getDaysLeftText(item)}</Text>
              <Text style={styles.itemBarcode}>#{item.barcode}</Text>
            </View>
          );
        }}
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
  row: { justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 6 },
  itemCard: { 
    width: CARD_WIDTH,
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginBottom: 6,
  },
  hexWrapper: { 
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emojiContainer: { 
    position: 'absolute',
    top: 32,
    alignItems: 'center',
  },
  emoji: { fontSize: 42 },
  itemName: { fontSize: 12, fontWeight: '700', color: '#f8fafc', textAlign: 'center', marginBottom: 2, lineHeight: 15, paddingHorizontal: 4 },
  itemDays: { fontSize: 11, fontWeight: '800', color: '#94a3b8' },
  itemBarcode: { fontSize: 8, color: '#64748b', marginTop: 2 },
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