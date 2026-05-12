import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { loadItems } from '../utils/firestoreStorage';
import { getGrokResponse } from '../utils/grokService';

export default function MealSuggestionsScreen({ navigation }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    const items = await loadItems();
    const itemNames = items.map(i => i.name);

    const prompt = `Suggest 7 realistic, tasty meals I can make with these pantry items: ${itemNames.join(', ')}. For each meal, give: name, short description, time to make, difficulty (Easy/Medium/Hard), and list of ingredients from my pantry that are used. Return as a JSON array of objects with keys: name, description, time, difficulty, ingredients.`;

    try {
      const response = await getGrokResponse(prompt, items);
      let parsed;
      try {
        parsed = JSON.parse(response.replace(/```json|```/g, '').trim());
      } catch (e) {
        parsed = Array.from({length: 7}, (_, i) => ({
          name: `Pantry Meal ${i+1}`,
          description: "Delicious meal using what you have!",
          time: "20 min",
          difficulty: "Easy",
          ingredients: itemNames.slice(0, 3)
        }));
      }
      setSuggestions(parsed.slice(0, 7));
    } catch (error) {
      console.error('Grok error:', error);
      setSuggestions(Array.from({length: 7}, (_, i) => ({
        name: `Pantry Meal ${i+1}`,
        description: "Delicious meal using what you have!",
        time: "20 min",
        difficulty: "Easy",
        ingredients: itemNames.slice(0, 3)
      })));
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meal Suggestions</Text>
      <Text style={styles.subtitle}>Personalized for your pantry</Text>

      {loading ? (
        <Text style={styles.loading}>Pantry Pro is generating you meals...</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {suggestions.map((recipe, index) => (
            <View key={index} style={styles.recipeCard}>
              <Text style={styles.recipeName}>{recipe.name}</Text>
              <Text style={styles.recipeDesc}>{recipe.description || ''}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>⏱ {recipe.time || '20 min'}</Text>
                <Text style={styles.meta}>🔥 {recipe.difficulty || 'Easy'}</Text>
              </View>
              {recipe.ingredients && (
                <Text style={styles.ingredients}>Uses: {recipe.ingredients.join(', ')}</Text>
              )}
              <TouchableOpacity style={styles.cookButton} onPress={() => Alert.alert('Coming soon!', 'Recipe details & instructions will be here!')}>
                <Text style={styles.cookButtonText}>Cook This 🍳</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.regenerateButton} onPress={loadSuggestions}>
        <Text style={styles.regenerateText}>Regenerate Meals 🔄</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f1e9', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3f2a1d', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#6b5b4f', marginBottom: 20 },
  loading: { fontSize: 16, color: '#6b5b4f', textAlign: 'center', marginTop: 40 },
  recipeCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e8d9c2' },
  recipeName: { fontSize: 18, fontWeight: '700', color: '#3f2a1d', marginBottom: 6 },
  recipeDesc: { fontSize: 14, color: '#6b5b4f', marginBottom: 10 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  meta: { fontSize: 13, color: '#e67e22', fontWeight: '600' },
  ingredients: { fontSize: 13, color: '#27ae60', marginBottom: 12 },
  cookButton: { backgroundColor: '#3f2a1d', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  cookButtonText: { color: '#fff', fontWeight: '700' },
  regenerateButton: { backgroundColor: '#e67e22', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  regenerateText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});