import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem('pantryItems');
      if (storedItems) setItems(JSON.parse(storedItems));
    } catch (e) {
      console.log(e);
    }
  };

  const expiringSoon = items.filter(item => {
    if (!item.expiryDate || item.expiryDate === 'NA') return false;
    const daysLeft = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantry Pal 🥬</Text>
      <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('Scan')}>
        <Text style={styles.scanButtonText}>📸 Scan New Item</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.inventoryButton} onPress={() => navigation.navigate('Inventory')}>
        <Text style={styles.inventoryButtonText}>📦 View Inventory</Text>
      </TouchableOpacity>

      {expiringSoon.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Expiring Soon ({expiringSoon.length})</Text>
          <FlatList
            data={expiringSoon}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => <Text style={styles.expiringItem}>{item.name} - {Math.ceil((new Date(item.expiryDate) - new Date()) / (1000*60*60*24))} days</Text>}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  scanButton: { backgroundColor: '#22c55e', padding: 20, borderRadius: 12, marginBottom: 15, alignItems: 'center' },
  scanButtonText: { color: 'white', fontSize: 20, fontWeight: '600' },
  inventoryButton: { backgroundColor: '#3b82f6', padding: 20, borderRadius: 12, alignItems: 'center' },
  inventoryButtonText: { color: 'white', fontSize: 20, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginVertical: 15, color: '#ef4444' },
  expiringItem: { padding: 10, backgroundColor: '#fef2f2', marginVertical: 4, borderRadius: 8 }
});