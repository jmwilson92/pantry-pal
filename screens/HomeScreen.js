import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import { loadItems } from '../utils/storage';

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadItems().then(setItems);
  }, []);

  const expiringSoon = items.filter(item => {
    if (!item.expiry || item.expiry === 'NA') return false;
    const daysLeft = Math.ceil((new Date(item.expiry) - new Date()) / (86400000));
    return daysLeft > 0 && daysLeft <= 7;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantry Pal 🥬</Text>
      <Text style={styles.subtitle}>Expiring soon: {expiringSoon.length} items</Text>
      <FlatList
        data={expiringSoon}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <Text style={styles.item}>{item.name} — {item.expiry}</Text>}
      />
      <Button title="Scan New Item" onPress={() => navigation.navigate('Scan')} />
      <Button title="View Full Inventory" onPress={() => navigation.navigate('Inventory')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  subtitle: { fontSize: 20, marginBottom: 10 },
  item: { padding: 12, backgroundColor: '#f0f0f0', marginVertical: 4, borderRadius: 8 }
});