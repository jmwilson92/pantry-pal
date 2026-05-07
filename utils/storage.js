import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@pantryItems';

export const loadItems = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const saveItem = async (newItem) => {
  try {
    const currentItems = await loadItems();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...currentItems, newItem]));
  } catch (e) {
    console.error(e);
  }
};

export const deleteItem = async (id) => {
  try {
    const currentItems = await loadItems();
    const filtered = currentItems.filter(item => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error(e);
  }
};