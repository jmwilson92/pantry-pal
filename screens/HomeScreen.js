import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { collection, onSnapshot, query, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function HomeScreen() {
  const [pantryItems, setPantryItems] = useState([]);
  const navigation = useNavigation();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    console.log('HomeScreen: Current user UID:', user.uid);

    const q = query(collection(db, 'pantries'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter for this user's items (handles both userId and uid field names)
      const userItems = allItems.filter(item => 
        item.userId === user.uid || item.uid === user.uid
      );

      console.log('HomeScreen: Found', userItems.length, 'items for this user');
      setPantryItems(userItems);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (item) => {
    try {
      await deleteDoc(doc(db, 'pantries', item.id));
      Alert.alert('Deleted', 'Item removed from pantry');
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  const handleMarkUsed = async (item) => {
    try {
      if ((item.quantity || 1) > 1) {
        await updateDoc(doc(db, 'pantries', item.id), {
          quantity: (item.quantity || 1) - 1
        });
      } else {
        await deleteDoc(doc(db, 'pantries', item.id));
      }
    } catch (error) {
      console.error('Mark used error:', error);
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        {item.photoUrl && (
          <Image source={{ uri: item.photoUrl }} style={styles.itemImage} />
        )}
        <View style={styles.itemText}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDetails}>
            {item.quantity || 1} {(item.quantity || 1) > 1 ? 'items' : 'item'}
            {item.expirationDate && ` • Expires ${new Date(item.expirationDate).toLocaleDateString()}`}
          </Text>
        </View>
      </View>
      {(item.quantity || 1) > 1 && (
        <View style={styles.quantityBadge}>
          <Text style={styles.quantityText}>{item.quantity}</Text>
        </View>
      )}
    </View>
  );

  const renderHiddenItem = ({ item }) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backBtn, styles.deleteBtn]}
        onPress={() => handleDelete(item)}
      >
        <Text style={styles.backText}>🗑️</Text>
        <Text style={styles.backText}>Compost</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backBtn, styles.eatBtn]}
        onPress={() => handleMarkUsed(item)}
      >
        <Text style={styles.backText}>🍽️</Text>
        <Text style={styles.backText}>Eat</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pantry Pal 🥬</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SwipeListView
        data={pantryItems}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-150}
        leftOpenValue={75}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your pantry is empty</Text>
            <Text style={styles.emptySubtext}>Scan items to get started!</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Scan')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f1e9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3f2a1d' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileIcon: { fontSize: 24 },
  itemContainer: { backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 6, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  itemContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  itemText: { flex: 1 },
  itemName: { fontSize: 18, fontWeight: '600', color: '#3f2a1d' },
  itemDetails: { fontSize: 14, color: '#7f6e5d', marginTop: 4 },
  quantityBadge: { backgroundColor: '#27ae60', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  quantityText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  rowBack: { alignItems: 'center', flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 15, marginHorizontal: 16, marginVertical: 6, borderRadius: 12 },
  backBtn: { alignItems: 'center', justifyContent: 'center', width: 75, height: '100%' },
  eatBtn: { backgroundColor: '#27ae60', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  deleteBtn: { backgroundColor: '#e74c3c', borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  backText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#e67e22', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 },
  fabText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 20, color: '#7f6e5d', fontWeight: '600' },
  emptySubtext: { fontSize: 16, color: '#a38b6f', marginTop: 8 },
});