import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native';
import { loadItems } from '../utils/storage';

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadItems().then(setItems);
  }, []);

  const expiringSoon = items.filter(item => {
    if (!item.expiry || item.expiry === 'NA') return false;
    const daysLeft = Math.ceil((new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 7;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🥬 Pantry Pal</Text>
      <Text style={styles.subtitle}>Expiring Soon: {expiringSoon.length} items</Text>
      <FlatList
        data={expiringSoon.slice(0,5)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.expiringItem}>
            <Text>{item.name}</Text>
            <Text style={{color: 'red'}}>{item.expiry}</Text>
          </View>
        )}
      />
      <Button title="Scan New Item" onPress={() => navigation.navigate('Scan')} />
      <Button title="View Inventory" onPress={() => navigation.navigate('Inventory')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f8f8' },
  title: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 20, textAlign: 'center', marginBottom: 20 },
  expiringItem: { backgroundColor: '#fff', padding: 15, marginVertical: 6, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 }
});