import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function InventoryScreen() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const stored = await AsyncStorage.getItem('pantryItems');
    if (stored) setItems(JSON.parse(stored));
  };

  const getDaysLeft = (expiry) => {
    if (!expiry || expiry === 'NA') return 'No expiry';
    const days = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days` : 'Expired';
  };

  const getColor = (expiry) => {
    if (!expiry || expiry === 'NA') return '#64748b';
    const days = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return '#ef4444';
    if (days <= 3) return '#f59e0b';
    return '#22c55e';
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.itemCard, { borderLeftColor: getColor(item.expiryDate) }]}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetail}>Qty: {item.quantity} • {getDaysLeft(item.expiryDate)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f8fafc' },
  itemCard: { backgroundColor: 'white', padding: 15, marginVertical: 6, borderRadius: 10, borderLeftWidth: 6 },
  itemName: { fontSize: 18, fontWeight: '600' },
  itemDetail: { fontSize: 14, color: '#64748b', marginTop: 4 }
});