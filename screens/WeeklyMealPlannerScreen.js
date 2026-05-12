import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function WeeklyMealPlannerScreen({ navigation }) {
  const mockPlan = [
    { day: 'Monday', breakfast: 'Avocado Toast', lunch: 'Chicken Salad', dinner: 'Pasta Primavera', emoji: '🥑' },
    { day: 'Tuesday', breakfast: 'Scrambled Eggs', lunch: 'Turkey Wrap', dinner: 'Beef Stir Fry', emoji: '🥚' },
    { day: 'Wednesday', breakfast: 'Greek Yogurt Bowl', lunch: 'Quinoa Salad', dinner: 'Grilled Salmon', emoji: '🥗' },
    { day: 'Thursday', breakfast: 'Oatmeal with Berries', lunch: 'Hummus Wrap', dinner: 'Chicken Curry', emoji: '🍓' },
    { day: 'Friday', breakfast: 'Smoothie Bowl', lunch: 'Tuna Salad', dinner: 'Pizza Night', emoji: '🍕' },
    { day: 'Saturday', breakfast: 'Pancakes', lunch: 'BLT Sandwich', dinner: 'BBQ Ribs', emoji: '🥞' },
    { day: 'Sunday', breakfast: 'French Toast', lunch: 'Soup & Salad', dinner: 'Roast Chicken', emoji: '🍞' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Meal Planner</Text>
      <Text style={styles.subtitle}>Your personalized 7-day plan</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {mockPlan.map((dayPlan, index) => (
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

      <TouchableOpacity style={styles.regenerateButton}>
        <Text style={styles.regenerateText}>Regenerate Plan</Text>
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