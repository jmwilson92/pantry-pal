import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getGrokMealSuggestions } from '../utils/grokService';
import { useNavigation } from '@react-navigation/native';

export default function MealSuggestionsScreen() {
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const navigation = useNavigation();

  // Load meals once when screen mounts (no auto-regenerate on every visit)
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const suggestions = await getGrokMealSuggestions();
        if (suggestions && suggestions.length > 0) {
          setMeals(suggestions);
        }
      } catch (err) {
        console.error("Load meals error:", err);
      }
      setIsLoading(false);
    };
    loadMeals();
  }, []);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newSuggestions = await getGrokMealSuggestions();
      if (newSuggestions && newSuggestions.length > 0) {
        setMeals(newSuggestions);
      }
    } catch (err) {
      console.error("Regenerate error:", err);
      Alert.alert("Error", "Failed to regenerate meals");
    }
    setIsRegenerating(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e67e22" />
        <Text style={styles.loadingText}>Pantry Pro is generating meals...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meal Suggestions</Text>
        <TouchableOpacity 
          style={styles.regenerateButton} 
          onPress={handleRegenerate}
          disabled={isRegenerating}
        >
          <Text style={styles.regenerateText}>
            {isRegenerating ? "Regenerating..." : "🔄 Regenerate"}
          </Text>
        </TouchableOpacity>
      </View>

      {meals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No meals generated yet</Text>
          <TouchableOpacity style={styles.button} onPress={handleRegenerate}>
            <Text style={styles.buttonText}>Generate Meals</Text>
          </TouchableOpacity>
        </View>
      ) : (
        meals.map((meal, index) => (
          <View key={index} style={styles.mealCard}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealDescription}>{meal.description}</Text>
            
            <Text style={styles.ingredientsTitle}>Ingredients:</Text>
            {meal.ingredients && meal.ingredients.slice(0, 4).map((ing, i) => (
              <Text key={i} style={styles.ingredient}>• {ing}</Text>
            ))}
            {meal.ingredients && meal.ingredients.length > 4 && (
              <Text style={styles.moreText}>+{meal.ingredients.length - 4} more</Text>
            )}

            <TouchableOpacity 
              style={styles.cookButton}
              onPress={() => navigation.navigate('CookThis', { meal })}
            >
              <Text style={styles.cookButtonText}>🍳 Cook This</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f1e9', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#3f2a1d' },
  regenerateButton: { backgroundColor: '#e67e22', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  regenerateText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#7f6e5d' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: '#7f6e5d', textAlign: 'center' },
  mealCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  mealName: { fontSize: 18, fontWeight: '700', color: '#3f2a1d', marginBottom: 8 },
  mealDescription: { fontSize: 14, color: '#7f6e5d', lineHeight: 20, marginBottom: 12 },
  ingredientsTitle: { fontSize: 13, fontWeight: '600', color: '#3f2a1d', marginBottom: 4 },
  ingredient: { fontSize: 13, color: '#7f6e5d', marginLeft: 8, marginBottom: 2 },
  moreText: { fontSize: 12, color: '#e67e22', fontStyle: 'italic', marginLeft: 8 },
  cookButton: { backgroundColor: '#27ae60', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  cookButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  button: { backgroundColor: '#e67e22', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});