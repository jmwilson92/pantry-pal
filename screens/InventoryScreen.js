import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert } from 'react-native';
import { loadItems, deleteItem } from '../utils/storage';

export default function InventoryScreen() {
  const [items, setItems] = useState([]);

  const refresh = async () => {
    const loaded = await loadItems();
    setItems(loaded);
  };

  useEffect(() => {
    refresh();
  }, []);

  const getColor = (expiry) => {
    if (!expiry || expiry === 'NA') return '#666';
    const days = Math.ceil((new Date(expiry) - new Date()) / (1000*60*60*24));
    if (days < 0) return 'red';
    if (days <= 3) return 'orange';
    if (days <= 7) return 'gold';
    return 'green';
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftColor: getColor(item.expiry), borderLeftWidth: 8 }]}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.expiry}>Expiry: {item.expiry || 'NA'}</Text>
            <TouchableOpacity onPress={() => {
              deleteItem(item.id);
              refresh();
            }}>
              <Text style={styles.deleteText}>Mark as Used / Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Button title="Refresh" onPress={refresh} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f8f8f8' },
  card: { backgroundColor: '#fff', padding: 15, marginVertical: 8, borderRadius: 12, elevation: 3 },
  name: { fontSize: 18, fontWeight: '600' },
  expiry: { marginVertical: 4 },
  deleteText: { color: 'red', marginTop: 8, fontWeight: 'bold' }
});