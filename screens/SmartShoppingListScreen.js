import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { loadItems } from '../utils/firestoreStorage';

export default function SmartShoppingListScreen({ navigation }) {
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateSmartList();
  }, []);

  const generateSmartList = async () => {
    setLoading(true);
    const pantryItems = await loadItems();
    const pantryNames = pantryItems.map(i => i.name.toLowerCase());

    // Mock meal plan ingredients (in real version this would come from the planner)
    const mealPlanIngredients = [
      'Avocados', 'Chicken Breast', 'Brown Rice', 'Broccoli', 'Eggs', 'Olive Oil', 'Tomatoes', 'Pasta', 'Onions', 'Garlic', 'Cheese', 'Milk'
    ];

    const needed = mealPlanIngredients
      .filter(item => !pantryNames.includes(item.toLowerCase()))
      .map((item, index) => ({
        id: index,
        name: item,
        qty: '1',
        checked: false
      }));

    setShoppingList(needed.length > 0 ? needed : [{ id: 99, name: 'Everything you need is already in your pantry!', qty: '', checked: false }]);
    setLoading(false);
  };

  const toggleCheck = (id) => {
    setShoppingList(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const uncheckedItems = shoppingList.filter(i => !i.checked && i.name !== 'Everything you need is already in your pantry!').length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Grocery List</Text>
      <Text style={styles.subtitle}>Based on your meal plan • {uncheckedItems} items left to buy</Text>

      {loading ? (
        <Text style={styles.loading}>Pantry Pro is calculating what you need...</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {shoppingList.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.listItem}
              onPress={() => toggleCheck(item.id)}
            >
              <View style={styles.checkboxContainer}>
                <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                  {item.checked && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, item.checked && styles.itemChecked]}>{item.name}</Text>
                <Text style={styles.itemQty}>{item.qty}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add Custom Item</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exportButton}>
        <Text style={styles.exportText}>Export to Notes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f1e9', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3f2a1d', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#6b5b4f', marginBottom: 20 },
  loading: { fontSize: 16, color: '#6b5b4f', textAlign: 'center', marginTop: 40 },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e8d9c2' },
  checkboxContainer: { marginRight: 14 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#3f2a1d', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  checkmark: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#3f2a1d' },
  itemChecked: { textDecorationLine: 'line-through', color: '#6b5b4f' },
  itemQty: { fontSize: 13, color: '#6b5b4f', marginTop: 2 },
  addButton: { backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, borderWidth: 2, borderColor: '#e67e22' },
  addButtonText: { color: '#e67e22', fontSize: 16, fontWeight: '700' },
  exportButton: { backgroundColor: '#3f2a1d', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  exportText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});