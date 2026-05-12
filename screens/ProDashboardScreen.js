import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function ProDashboardScreen({ navigation }) {
  const features = [
    { id: 1, title: 'Meal Suggestions', desc: '7 personalized recipes based on your pantry', screen: 'MealSuggestions' },
    { id: 2, title: 'Weekly Meal Planner', desc: 'Full 7-day plan with breakfast, lunch & dinner', screen: 'WeeklyMealPlanner' },
    { id: 3, title: 'Smart Grocery List', desc: 'What to buy based on your meal plan & pantry', screen: 'SmartShoppingList' },
    { id: 4, title: 'Pantry Analytics', desc: 'See what you waste & save money', screen: null },
    { id: 5, title: 'Recipe Saving', desc: 'Save your favorite recipes', screen: null },
    { id: 6, title: 'Enhanced Expiry Alerts', desc: 'Smart reminders before things go bad', screen: null },
    { id: 7, title: 'Dietary Filters', desc: 'Vegan, Keto, Gluten-Free & more', screen: null },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantry Pal Pro</Text>
      <Text style={styles.subtitle}>Unlock premium features</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={styles.featureCard}
            onPress={() => feature.screen && navigation.navigate(feature.screen)}
            disabled={!feature.screen}
          >
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDesc}>{feature.desc}</Text>
            {!feature.screen && <Text style={styles.comingSoon}>Coming Soon</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f1e9', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#3f2a1d', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b5b4f', marginBottom: 24 },
  featureCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e8d9c2' },
  featureTitle: { fontSize: 20, fontWeight: '700', color: '#3f2a1d', marginBottom: 6 },
  featureDesc: { fontSize: 15, color: '#6b5b4f' },
  comingSoon: { fontSize: 13, color: '#e67e22', fontWeight: '600', marginTop: 8 },
});