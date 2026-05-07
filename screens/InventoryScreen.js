import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert } from 'react-native';
import { loadItems, deleteItem } from '../utils/storage';

export default function InventoryScreen() {
  const [items, setItems] = useState([]);

  const refresh = async () => {
    const data = await loadItems();
    setItems(data);
  };

  useEffect(() => {
    refresh();
  }, []);

  const getExpiryColor = (expiry) => {
    if (!expiry || expiry === 'NA') return '#666666';
    const daysLeft = Math.ceil((new Date(expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return '#ff0000';
    if (daysLeft <= 3) return '#ff9800';
    if (daysLeft <= 7) return '#ffc107';
    return '#4caf50';
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftColor: getExpiryColor(item.expiry), borderLeftWidth: 6 }]}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.expiry}>Expires: {item.expiry || 'No expiry'}</Text>
            <TouchableOpacity onPress={() => {
              Alert.alert('Confirm', 'Mark as used / delete?', [
                { text: 'Cancel' },
                { text: 'Delete', onPress: () => { deleteItem(item.id); refresh(); } }
              ]);
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
  container: { flex: 1, padding: 15, backgroundColor: '#f8f9fa' },
  card: { backgroundColor: '#fff', padding: 15, marginVertical: 8, borderRadius: 12, elevation: 3 },
  name: { fontSize: 18, fontWeight: 'bold' },
  expiry: { fontSize: 15, color: '#555', marginTop: 4 },
  deleteText: { color: 'red', fontWeight: 'bold', marginTop: 10 }
});