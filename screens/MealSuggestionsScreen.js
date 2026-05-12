import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getGrokMealSuggestions, getCookingInstructions } from '../utils/grokService';

export default function MealSuggestionsScreen() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [servingsMultiplier, setServingsMultiplier] = useState(1);
  const navigation = useNavigation();

  const generateMeals = async () => {
    setLoading(true);
    try {
      const suggestions = await getGrokMealSuggestions();
      setMeals(suggestions);
    } catch (error) {
      console.error('Error generating meals:', error);
      setMeals([]);
    }
    setLoading(false);
  };

  const handleCookThis = async (meal) => {
    setSelectedMeal(meal);
    setServingsMultiplier(1);
    setInstructions('Pantry Pro is generating cooking instructions...');
    setShowInstructions(true);
    
    try {
      const instructionsText = await getCookingInstructions(meal.name, meal.ingredients || []);
      setInstructions(instructionsText);
    } catch (error) {
      setInstructions('Sorry, could not generate instructions right now. Try again later.');
    }
  };

  const scaledIngredients = (ingredients) => {
    if (!ingredients || !Array.isArray(ingredients)) return [];
    return ingredients.map(ing => {
      const match = ing.match(/(\d+\.?\d*)\s*(.*)/);
      if (match) {
        const num = parseFloat(match[1]) * servingsMultiplier;
        return `${num} ${match[2]}`;
      }
      return ing;
    });
  };

  useEffect(() => {
    generateMeals();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meal Suggestions</Text>
        <TouchableOpacity onPress={generateMeals} style={styles.regenerateButton}>
          <Text style={styles.regenerateText}>Regenerate</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e67e22" />
          <Text style={styles.loadingText}>Pantry Pro is generating you meals...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {meals.map((meal, index) => (
            <View key={index} style={styles.mealCard}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealDescription}>{meal.description}</Text>
                
                {meal.ingredients && meal.ingredients.length > 0 && (
                  <View style={styles.ingredientsContainer}>
                    <Text style={styles.ingredientsTitle}>Ingredients:</Text>
                    {meal.ingredients.slice(0, 4).map((ing, i) => (
                      <Text key={i} style={styles.ingredientItem}>• {ing}</Text>
                    ))}
                    {meal.ingredients.length > 4 && <Text style={styles.moreText}>+{meal.ingredients.length - 4} more</Text>}
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.cookButton}
                  onPress={() => handleCookThis(meal)}
                >
                  <Text style={styles.cookButtonText}>Cook this</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={showInstructions} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedMeal?.name}</Text>
            
            <View style={styles.servingsRow}>
              <Text style={styles.servingsLabel}>Servings:</Text>
              <TouchableOpacity onPress={() => setServingsMultiplier(0.5)} style={[styles.servingsBtn, servingsMultiplier === 0.5 && styles.activeBtn]}>
                <Text style={styles.servingsBtnText}>1/2x</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setServingsMultiplier(1)} style={[styles.servingsBtn, servingsMultiplier === 1 && styles.activeBtn]}>
                <Text style={styles.servingsBtnText}>1x</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setServingsMultiplier(2)} style={[styles.servingsBtn, servingsMultiplier === 2 && styles.activeBtn]}>
                <Text style={styles.servingsBtnText}>2x</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setServingsMultiplier(3)} style={[styles.servingsBtn, servingsMultiplier === 3 && styles.activeBtn]}>
                <Text style={styles.servingsBtnText}>3x</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.ingredientsTitle}>Ingredients ({servingsMultiplier}x):</Text>
            <ScrollView style={styles.ingredientsList}>
              {scaledIngredients(selectedMeal?.ingredients).map((ing, i) => (
                <Text key={i} style={styles.ingredientItem}>• {ing}</Text>
              ))}
            </ScrollView>

            <Text style={styles.instructionsTitle}>Instructions:</Text>
            <ScrollView style={styles.instructionsScroll}>
              <Text style={styles.instructionsText}>{instructions}</Text>
            </ScrollView>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowInstructions(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f1e9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#3f2a1d' },
  regenerateButton: { backgroundColor: '#e67e22', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  regenerateText: { color: '#fff', fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#7f6e5d' },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  mealCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  mealInfo: {  },
  mealName: { fontSize: 18, fontWeight: '700', color: '#3f2a1d', marginBottom: 8 },
  mealDescription: { fontSize: 14, color: '#7f6e5d', lineHeight: 20, marginBottom: 12 },
  ingredientsContainer: { marginBottom: 12 },
  ingredientsTitle: { fontSize: 13, fontWeight: '600', color: '#3f2a1d', marginBottom: 4 },
  ingredientItem: { fontSize: 13, color: '#7f6e5d', marginLeft: 8, marginBottom: 2 },
  moreText: { fontSize: 12, color: '#e67e22', fontStyle: 'italic', marginLeft: 8 },
  cookButton: { backgroundColor: '#27ae60', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  cookButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, width: '90%', maxHeight: '85%', padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#3f2a1d', marginBottom: 12 },
  servingsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  servingsLabel: { fontSize: 14, fontWeight: '600', color: '#3f2a1d' },
  servingsBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f0f0f0' },
  activeBtn: { backgroundColor: '#e67e22' },
  servingsBtnText: { fontSize: 13, fontWeight: '600', color: '#3f2a1d' },
  instructionsTitle: { fontSize: 14, fontWeight: '600', color: '#3f2a1d', marginTop: 12, marginBottom: 6 },
  instructionsScroll: { maxHeight: 300 },
  instructionsText: { fontSize: 15, lineHeight: 22, color: '#3f2a1d' },
  closeButton: { backgroundColor: '#e67e22', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  closeButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});