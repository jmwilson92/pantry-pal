import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { loadItems } from '../utils/firestoreStorage';
import { getGrokResponse } from '../utils/grokService';

export default function WeeklyMealPlannerScreen({ navigation }) {
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    setLoading(true);
    const items = await loadItems();
    const itemNames = items.map(i => i.name);

    const prompt = `Create a realistic 7-day meal plan (breakfast, lunch, dinner) using these pantry items: ${itemNames.join(', ')}. Return as JSON array with keys: day, breakfast, lunch, dinner, emoji. Make it practical and fun.`;

    try {
      const response = await getGrokResponse(prompt, items);
      let parsed;
      try {
        parsed = JSON.parse(response.replace(/```json|```/g, '').trim());
      } catch (e) {
        parsed = [
          { day: 'Monday', breakfast: 'Avocado Toast', lunch: 'Chicken Salad', dinner: 'Pasta Primavera', emoji: '🥑' }
        ];
      }
      setPlan(parsed);
    } catch (error) {
      console.error('Grok error:', error);
      setPlan([
        { day: 'Monday', breakfast: 'Avocado Toast', lunch: 'Chicken Salad', dinner: 'Pasta Primavera', emoji: '🥑' }
      ]);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Meal Planner</Text>
      <Text style={styles.subtitle}>Powered by Grok AI • Personalized 7-day plan</Text>

      {loading ? (
        <Text style={styles.loading}>Grok is planning your week... 🤖</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {plan.map((dayPlan, index) => (
            <View key={index} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.emoji}>{dayPlan.emoji}</Text>
                <Text style={styles.dayName}>{dayPlan.day}</Text>
              </View>
              <View style={styles.mealRow}>
                <Text style={styles.mealLabel}>Breakfast</Text>
                <Text style={styles.mealName}>{dayPlan.breakfast}</Text>
              </View>
              <View style={styles.mealRow}>
                <Text style={styles.mealLabel}>Lunch</Text>
                <Text style={styles.mealName}>{dayPlan.lunch}</Text>
              </View>
              <View style={styles.mealRow}>
                <Text style={styles.mealLabel}>Dinner</Text>
                <Text style={styles.mealName}>{dayPlan.dinner}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.regenerateButton} onPress={loadPlan}>
        <Text style={styles.regenerateText}>Regenerate with Grok 🔄</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f1e9', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3f2a1d', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#6b5b4f', marginBottom: 20 },
  dayCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e8d9c2' },
  dayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  emoji: { fontSize: 28, marginRight: 12 },
  dayName: { fontSize: 20, fontWeight: '700', color: '#3f2a1d' },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  mealLabel: { fontSize: 14, color: '#6b5b4f', fontWeight: '600' },
  mealName: { fontSize: 15, color: '#3f2a1d', fontWeight: '600' },
  regenerateButton: { backgroundColor: '#e67e22', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  regenerateText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});