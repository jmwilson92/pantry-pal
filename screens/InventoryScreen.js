import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { loadItems, deleteItem } from '../utils/storage';

export default function InventoryScreen() {
  const [items, setItems] = useState([]);

  const refresh = async () => {
    const loaded = await loadItems();
    setItems(loaded);
  };

  useEffect(() => { refresh(); }, []);

  const getColor = (expiry) => {
    if (!expiry || expiry === 'NA') return '#666';
    const days = Math.ceil((new Date(expiry) - new Date()) / 86400000);
    if (days < 0) return 'red';
    if (days <= 3) return 'orange';
    return days <= 7 ? 'yellow' : 'green';
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.itemCard, { borderLeftColor: getColor(item.expiry), borderLeftWidth: 8 }]}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>Expires: {item.expiry || 'NA'}</Text>
            <TouchableOpacity onPress={() => { deleteItem(item.id); refresh(); }}>
              <Text style={styles.delete}>Mark as Used / Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Button title="Refresh List" onPress={refresh} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  itemCard: { backgroundColor: '#fff', padding: 15, marginVertical: 6, borderRadius: 10, elevation: 2 },
  name: { fontSize: 18, fontWeight: 'bold' },
  delete: { color: 'red', marginTop: 8, fontWeight: 'bold' }
});