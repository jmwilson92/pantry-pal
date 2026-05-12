import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { loadItems } from '../utils/firestoreStorage';
import { getGrokResponse } from '../utils/grokService';

export default function WeeklyMealPlannerScreen({ navigation }) {
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    setLoading(true);
    const items = await loadItems();
    const itemNames = items.map(i => i.name);

    const prompt = `Create a realistic 7-day meal plan using these pantry items: ${itemNames.join(', ')}. Return as JSON array with keys: day, breakfast, lunch, dinner, emoji. Make it practical and fun.`;

    try {
      const response = await getGrokResponse(prompt, items);
      let parsed;
      try {
        parsed = JSON.parse(response.replace(/```json|```/g, '').trim());
      } catch (e) {
        parsed = Array.from({length: 7}, (_, i) => ({
          day: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][i],
          breakfast: 'Avocado Toast',
          lunch: 'Chicken Salad',
          dinner: 'Pasta Primavera',
          emoji: '🥑'
        }));
      }
      setPlan(parsed);
    } catch (error) {
      console.error('Grok error:', error);
      setPlan(Array.from({length: 7}, (_, i) => ({
        day: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][i],
        breakfast: 'Avocado Toast',
        lunch: 'Chicken Salad',
        dinner: 'Pasta Primavera',
        emoji: '🥑'
      })));
    }
    setLoading(false);
  };

  const showMealDetails = (mealName, type, day) => {
    setSelectedMeal({ name: mealName, type, day });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Meal Planner</Text>
      <Text style={styles.subtitle}>7-day plan tailored to your pantry</Text>

      {loading ? (
        <Text style={styles.loading}>Pantry Pro is planning your week...</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {plan.map((dayPlan, index) => (
            <View key={index} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.emoji}>{dayPlan.emoji}</Text>
                <Text style={styles.dayName}>{dayPlan.day}</Text>
              </View>
              <TouchableOpacity onPress={() => showMealDetails(dayPlan.breakfast, 'Breakfast', dayPlan.day)}>
                <View style={styles.mealRow}>
                  <Text style={styles.mealLabel}>Breakfast</Text>
                  <Text style={styles.mealName}>{dayPlan.breakfast}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => showMealDetails(dayPlan.lunch, 'Lunch', dayPlan.day)}>
                <View style={styles.mealRow}>
                  <Text style={styles.mealLabel}>Lunch</Text>
                  <Text style={styles.mealName}>{dayPlan.lunch}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => showMealDetails(dayPlan.dinner, 'Dinner', dayPlan.day)}>
                <View style={styles.mealRow}>
                  <Text style={styles.mealLabel}>Dinner</Text>
                  <Text style={styles.mealName}>{dayPlan.dinner}</Text>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.regenerateButton} onPress={loadPlan}>
        <Text style={styles.regenerateText}>Regenerate Plan 🔄</Text>
      </TouchableOpacity>

      <Modal visible={!!selectedMeal} transparent animationType="slide" onRequestClose={() => setSelectedMeal(null)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedMeal?.name}</Text>
            <Text style={styles.modalType}>{selectedMeal?.type} • {selectedMeal?.day}</Text>
            <Text style={styles.modalSection}>Ingredients (from your pantry + a few extras):</Text>
            <Text style={styles.modalText}>Avocado, Eggs, Bread, Olive Oil, Salt, Pepper</Text>
            <Text style={styles.modalSection}>Key Nutrients:</Text>
            <Text style={styles.modalText}>• Protein: 12g
• Healthy Fats: 15g
• Fiber: 8g
• Vitamin C: 25% DV</Text>
            <Text style={styles.modalSection}>Visual:</Text>
            <Text style={styles.modalEmoji}>🥑🥑🥑</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedMeal(null)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f1e9', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3f2a1d', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#6b5b4f', marginBottom: 20 },
  loading: { fontSize: 16, color: '#6b5b4f', textAlign: 'center', marginTop: 40 },
  dayCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e8d9c2' },
  dayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  emoji: { fontSize: 28, marginRight: 12 },
  dayName: { fontSize: 20, fontWeight: '700', color: '#3f2a1d' },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, paddingVertical: 4 },
  mealLabel: { fontSize: 14, color: '#6b5b4f', fontWeight: '600' },
  mealName: { fontSize: 15, color: '#3f2a1d', fontWeight: '600' },
  regenerateButton: { backgroundColor: '#e67e22', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  regenerateText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 20, width: '90%' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#3f2a1d', marginBottom: 8 },
  modalType: { fontSize: 16, color: '#e67e22', marginBottom: 20 },
  modalSection: { fontSize: 14, fontWeight: '600', color: '#3f2a1d', marginTop: 12 },
  modalText: { fontSize: 14, color: '#6b5b4f', marginTop: 4 },
  modalEmoji: { fontSize: 40, textAlign: 'center', marginVertical: 12 },
  closeButton: { backgroundColor: '#3f2a1d', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  closeText: { color: '#fff', fontWeight: '700' },
});