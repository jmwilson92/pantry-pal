import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export async function addToGroceryList(ingredients) {
  const user = auth.currentUser;
  if (!user || !ingredients || ingredients.length === 0) return;

  const groceryRef = doc(db, 'users', user.uid, 'groceryList', 'current');

  try {
    const docSnap = await getDoc(groceryRef);
    
    let currentList = [];
    if (docSnap.exists()) {
      currentList = docSnap.data().items || [];
    }

    // Add new ingredients (avoid duplicates)
    const newItems = ingredients.filter(ing => !currentList.some(item => item.toLowerCase() === ing.toLowerCase()));
    
    if (newItems.length > 0) {
      await setDoc(groceryRef, {
        items: [...currentList, ...newItems],
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log('Added to grocery list:', newItems.length, 'new items');
    }
  } catch (error) {
    console.error('Error adding to grocery list:', error);
  }
}
