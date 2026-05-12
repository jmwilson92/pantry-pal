import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

export default function ProDashboardScreen({ navigation }) {
  const features = [
    {
      id: 1,
      title: "Meal Suggestions",
      emoji: "🍽️",
      description: "Get smart recipe ideas based on what you have in your pantry.",
      screen: "MealSuggestions",
    },
    {
      id: 2,
      title: "Weekly Meal Planner",
      emoji: "📅",
      description: "Automatically generate a full 7-day meal plan from your ingredients.",
      screen: null,
    },
    {
      id: 3,
      title: "Smart Grocery List",
      emoji: "🛍️",
      description: "Auto-generate shopping lists from your meal plans.",
      screen: null,
    },
    {
      id: 4,
      title: "Pantry Analytics",
      emoji: "📊",
      description: "See what you waste, what you use most, and money-saving insights.",
      screen: null,
    },
    {
      id: 5,
      title: "Recipe Saving",
      emoji: "📝",
      description: "Save your favorite recipes and access them anytime.",
      screen: null,
    },
    {
      id: 6,
      title: "Enhanced Expiry Alerts",
      emoji: "⏰",
      description: "Get smarter, more frequent notifications before food goes bad.",
      screen: null,
    },
    {
      id: 7,
      title: "Dietary Filters",
      emoji: "🥗",
      description: "Filter suggestions for Vegan, Keto, Gluten-Free, and more.",
      screen: null,
    },
  ];

  const handleFeaturePress = (feature) => {
    if (feature.screen) {
      navigation.navigate(feature.screen);
    } else {
      Alert.alert(
        feature.title,
        feature.description + "\n\nThis feature is coming soon!",
        [{ text: "Got it" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantry Pal Pro</Text>
      <Text style={styles.subtitle}>Unlock the full power of your pantry</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={styles.featureCard}
            onPress={() => handleFeaturePress(feature)}
          >
            <View style={styles.featureHeader}>
              <Text style={styles.emoji}>{feature.emoji}</Text>
              <Text style={styles.featureTitle}>{feature.title}</Text>
            </View>
            <Text style={styles.featureDescription}>{feature.description}</Text>
            <View style={styles.arrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.upgradeButton}
        onPress={() => navigation.navigate('Subscription')}
      >
        <Text style={styles.upgradeText}>Manage Subscription</Text>
      </TouchableOpacity>
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
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8d9c2',
    position: 'relative',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3f2a1d',
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b5b4f',
    lineHeight: 20,
  },
  arrow: {
    position: 'absolute',
    right: 18,
    top: 18,
  },
  arrowText: {
    fontSize: 20,
    color: '#22c55e',
  },
  upgradeButton: {
    backgroundColor: '#22c55e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  upgradeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});