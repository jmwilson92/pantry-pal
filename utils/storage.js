import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@pantryItems';

export const loadItems = async () => {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) { return []; }
};

// Smart save: stacks quantity if no expiry date exists for same item
export const saveItem = async (newItem) => {
  try {
    const items = await loadItems();

    // If item has no expiry, try to stack it
    if (!newItem.hasExpiry) {
      const existingIndex = items.findIndex(
        item => item.name.toLowerCase() === newItem.name.toLowerCase() && !item.hasExpiry
      );

      if (existingIndex !== -1) {
        // Stack quantity
        items[existingIndex].quantity = (items[existingIndex].quantity || 1) + (newItem.quantity || 1);
        await AsyncStorage.setItem(KEY, JSON.stringify(items));
        return;
      }
    }

    // Otherwise create new entry
    const itemWithId = {
      ...newItem,
      id: Date.now().toString(),
      quantity: newItem.quantity || 1,
    };
    await AsyncStorage.setItem(KEY, JSON.stringify([...items, itemWithId]));
  } catch (e) {
    console.log('Error saving item:', e);
  }
};

export const deleteItem = async (id) => {
  try {
    const items = await loadItems();
    await AsyncStorage.setItem(KEY, JSON.stringify(items.filter(i => i.id !== id)));
  } catch (e) {}
};

export const markAsUsed = async (id) => {
  try {
    const items = await loadItems();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return;

    const item = items[index];
    if (item.quantity > 1) {
      item.quantity -= 1;
      await AsyncStorage.setItem(KEY, JSON.stringify(items));
    } else {
      // Remove item if quantity reaches 0
      items.splice(index, 1);
      await AsyncStorage.setItem(KEY, JSON.stringify(items));
    }
  } catch (e) {
    console.log('Error marking as used:', e);
  }
};