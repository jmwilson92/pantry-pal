import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function InventoryScreen() {
  const dummyItems = [
    { id: '1', name: 'Milk', expiry: '2026-05-12', location: 'Fridge' },
    { id: '2', name: 'Bread', expiry: '2026-05-08', location: 'Pantry' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Inventory</Text>
      <FlatList
        data={dummyItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.name} ({item.location})</Text>
            <Text>Expires: {item.expiry}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  item: { padding: 15, backgroundColor: '#fff', marginBottom: 10, borderRadius: 8 }
});
