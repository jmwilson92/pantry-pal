import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, CheckBox } from 'react-native';

export default function SmartShoppingListScreen({ navigation }) {
  const mockList = [
    { id: 1, name: 'Avocados', qty: '3', checked: false },
    { id: 2, name: 'Chicken Breast', qty: '2 lbs', checked: false },
    { id: 3, name: 'Brown Rice', qty: '1 bag', checked: true },
    { id: 4, name: 'Broccoli', qty: '2 heads', checked: false },
    { id: 5, name: 'Eggs', qty: '1 dozen', checked: true },
    { id: 6, name: 'Olive Oil', qty: '1 bottle', checked: false },
    { id: 7, name: 'Tomatoes', qty: '4', checked: false },
    { id: 8, name: 'Pasta', qty: '1 box', checked: false },
  ];

  const [shoppingList, setShoppingList] = React.useState(mockList);

  const toggleCheck = (id) => {
    setShoppingList(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const uncheckedItems = shoppingList.filter(i => !i.checked).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Grocery List</Text>
      <Text style={styles.subtitle}>Generated from your meal plan • {uncheckedItems} items left</Text>

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