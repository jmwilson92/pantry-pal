import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@pantryItems';

export const loadItems = async () => {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) { return []; }
};

export const saveItem = async (item) => {
  try {
    const items = await loadItems();
    await AsyncStorage.setItem(KEY, JSON.stringify([...items, { ...item, id: Date.now().toString() }]));
  } catch (e) {}
};

export const deleteItem = async (id) => {
  try {
    const items = await loadItems();
    await AsyncStorage.setItem(KEY, JSON.stringify(items.filter(i => i.id !== id)));
  } catch (e) {}
};