import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

// Get current user's pantry collection
const getUserPantryCollection = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return collection(db, 'users', user.uid, 'pantry');
};

export const loadItems = async () => {
  try {
    const pantryRef = getUserPantryCollection();
    const q = query(pantryRef, orderBy('addedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (e) {
    console.log('Error loading items from Firestore:', e);
    return [];
  }
};

export const saveItem = async (newItem) => {
  try {
    const pantryRef = getUserPantryCollection();
    const itemToSave = {
      ...newItem,
      addedAt: new Date().toISOString(),
      quantity: newItem.quantity || 1,
    };
    
    await addDoc(pantryRef, itemToSave);
  } catch (e) {
    console.log('Error saving item to Firestore:', e);
  }
};

export const deleteItem = async (id) => {
  try {
    const user = auth.currentUser;
    if (!user) return;
    
    await deleteDoc(doc(db, 'users', user.uid, 'pantry', id));
  } catch (e) {
    console.log('Error deleting item:', e);
  }
};

export const markAsUsed = async (id) => {
  try {
    const user = auth.currentUser;
    if (!user) return;
    
    const itemRef = doc(db, 'users', user.uid, 'pantry', id);
    // For simplicity, we'll delete the item when marked as used
    // You can modify this to decrease quantity instead
    await deleteDoc(itemRef);
  } catch (e) {
    console.log('Error marking as used:', e);
  }
};