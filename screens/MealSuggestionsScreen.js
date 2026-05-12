import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { loadItems } from '../utils/firestoreStorage';

export default function MealSuggestionsScreen({ navigation }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    const items = await loadItems();
    const itemNames = items.map(i => i.name.toLowerCase());

    const recipes = [
      {
        id: 1,
        name: "Scrambled Eggs & Toast",
        emoji: "🥚",
        ingredients: ["eggs", "bread"],
        missing: [],
        time: "10 min",
        difficulty: "Easy",
      },
      {
        id: 2,
        name: "Avocado Toast",
        emoji: "🥑",
        ingredients: ["avocado", "bread"],
        missing: [],
        time: "5 min",
        difficulty: "Easy",
      },
      {
        id: 3,
        name: "Chicken Stir Fry",
        emoji: "🍗",
        ingredients: ["chicken", "rice", "vegetables"],
        missing: [],
        time: "20 min",
        difficulty: "Medium",
      },
      {
        id: 4,
        name: "Pasta with Tomato Sauce",
        emoji: "🍝",
        ingredients: ["pasta", "tomato"],
        missing: [],
        time: "15 min",
        difficulty: "Easy",
      },
      {
        id: 5,
        name: "Cheese Omelette",
        emoji: "🥚",
        ingredients: ["eggs", "cheese"],
        missing: [],
        time: "8 min",
        difficulty: "Easy",
      },
      {
        id: 6,
        name: "Veggie Fried Rice",
        emoji: "🍚",
        ingredients: ["rice", "vegetables", "eggs"],
        missing: [],
        time: "15 min",
        difficulty: "Easy",
      },
    ];

    // Filter recipes based on what user has
    const scoredRecipes = recipes.map(recipe => {
      const hasIngredients = recipe.ingredients.filter(ing => 
        itemNames.some(name => name.includes(ing))
      );
      const missingIngredients = recipe.ingredients.filter(ing => 
        !itemNames.some(name => name.includes(ing))
      );

      return {
        ...recipe,
        hasCount: hasIngredients.length,
        missingCount: missingIngredients.length,
        missing: missingIngredients,
        score: hasIngredients.length / recipe.ingredients.length,
      };
    });

    // Sort by how many ingredients they have
    const sorted = scoredRecipes.sort((a, b) => b.score - a.score);
    setSuggestions(sorted);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meal Suggestions</Text>
      <Text style={styles.subtitle}>Based on what you have in your pantry</Text>

      {loading ? (
        <Text style={styles.loading}>Loading suggestions...</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {suggestions.map((recipe, index) => (
            <View key={index} style={styles.recipeCard}>
              <View style={styles.recipeHeader}>
                <Text style={styles.emoji}>{recipe.emoji}</Text>
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeName}>{recipe.name}</Text>
                  <Text style={styles.recipeMeta}>
                    {recipe.time} • {recipe.difficulty}
                  </Text>
                </View>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>
                    {Math.round(recipe.score * 100)}% match
                  </Text>
                </View>
              </View>

              {recipe.missing.length > 0 && (
                <Text style={styles.missingText}>
                  Missing: {recipe.missing.join(', ')}
                </Text>
              )}

              <TouchableOpacity style={styles.cookButton}>
                <Text style={styles.cookButtonText}>Cook This</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f1e9',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3f2a1d',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b5b4f',
    marginBottom: 20,
  },
  loading: {
    fontSize: 16,
    color: '#6b5b4f',
    textAlign: 'center',
    marginTop: 40,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e8d9c2',
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  emoji: {
    fontSize: 32,
    marginRight: 14,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3f2a1d',
  },
  recipeMeta: {
    fontSize: 13,
    color: '#6b5b4f',
    marginTop: 2,
  },
  matchBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  missingText: {
    fontSize: 13,
    color: '#ef4444',
    marginBottom: 12,
  },
  cookButton: {
    backgroundColor: '#3f2a1d',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  cookButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});