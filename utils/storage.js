import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@pantry_pal_items';

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
    const items = await loadItems();
    const itemWithId = { ...newItem, id: Date.now().toString() };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...items, itemWithId]));
  } catch (e) {
    console.error(e);
  }
};

export const deleteItem = async (id) => {
  try {
    const items = await loadItems();
    const filtered = items.filter(item => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error(e);
  }
};