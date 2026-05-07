import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native';
import { loadItems } from '../utils/storage';

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);

  const loadData = async () => {
    const data = await loadItems();
    setItems(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const expiringSoon = items.filter(item => {
    if (!item.expiry || item.expiry === 'NA') return false;
    const expiryDate = new Date(item.expiry);
    const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 7;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantry Pal 🥬</Text>
      <Text style={styles.subtitle}>Expiring soon: {expiringSoon.length} items</Text>
      
      <FlatList
        data={expiringSoon}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.expiringCard}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text>Expires: {item.expiry}</Text>
          </View>
        )}
      />

      <Button title="Scan New Item" onPress={() => navigation.navigate('Scan')} />
      <Button title="View All Inventory" onPress={() => navigation.navigate('Inventory')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 20, textAlign: 'center', marginBottom: 20 },
  expiringCard: { backgroundColor: '#fff', padding: 15, marginVertical: 6, borderRadius: 12, elevation: 3 },
  itemName: { fontSize: 18, fontWeight: '600' }
});