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
import { useNavigation } from '@react-navigation/native';
import { getGrokWeeklyPlan } from '../utils/grokService';
import { useAuth } from '../context/AuthContext';
import { addToGroceryList } from '../utils/groceryStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WeeklyMealPlannerScreen() {
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [lockedDays, setLockedDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const { user } = useAuth();

  // Load plan from storage or generate new one
  useEffect(() => {
    const loadPlan = async () => {
      try {
        // Try to load from AsyncStorage first
        const savedPlan = await AsyncStorage.getItem('weeklyMealPlan');
        if (savedPlan) {
          const parsedPlan = JSON.parse(savedPlan);
          setWeeklyPlan(parsedPlan);
          console.log("Loaded saved plan with", parsedPlan.length, "days");
        } else {
          // Generate new plan if none saved
          const plan = await getGrokWeeklyPlan();
          if (plan && plan.length > 0) {
            setWeeklyPlan(plan);
            await AsyncStorage.setItem('weeklyMealPlan', JSON.stringify(plan));
            console.log("Generated and saved new plan with", plan.length, "days");
          } else {
            setError("Failed to load meal plan");
          }
        }
      } catch (err) {
        console.error("Load plan error:", err);
        setError("Failed to load meal plan");
      }
      setIsLoading(false);
    };
    loadPlan();
  }, []);

  const toggleLock = (day) => {
    if (lockedDays.includes(day)) {
      setLockedDays(lockedDays.filter(d => d !== day));
    } else {
      setLockedDays([...lockedDays, day]);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError(null);

    try {
      const newPlan = await getGrokWeeklyPlan();

      if (!newPlan || newPlan.length === 0) {
        setError("Grok didn't return a valid plan");
        setIsRegenerating(false);
        return;
      }

      // Keep locked days, replace unlocked ones
      const updatedPlan = weeklyPlan.map((existingDay, index) => {
        const isLocked = lockedDays.includes(existingDay.day);
        if (isLocked) {
          return existingDay;
        } else {
          return newPlan[index] || existingDay;
        }
      });

      setWeeklyPlan(updatedPlan);
      await AsyncStorage.setItem('weeklyMealPlan', JSON.stringify(updatedPlan));
      console.log("Regenerated plan with", updatedPlan.length, "days, locked:", lockedDays.length);
    } catch (err) {
      console.error("Regenerate error:", err);
      setError("Failed to regenerate plan");
    }

    setIsRegenerating(false);
  };

  const handleTransferToGroceryList = async () => {
    if (lockedDays.length !== 7) {
      Alert.alert("Lock all days first", "You need to lock all 7 days before transferring to grocery list");
      return;
    }

    try {
      const allIngredients = [];
      weeklyPlan.forEach(day => {
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
          const meal = day[mealType];
          if (meal && meal.ingredients && Array.isArray(meal.ingredients)) {
            meal.ingredients.forEach(ing => {
              allIngredients.push({
                name: ing,
                quantity: "1",
                unit: "",
                source: `${day.day} - ${mealType}`
              });
            });
          }
        });
      });

      await addToGroceryList(allIngredients);
      Alert.alert("Success", "All ingredients added to your Smart Grocery List!");
      navigation.navigate('SmartShoppingList');
    } catch (err) {
      console.error("Transfer error:", err);
      Alert.alert("Error", "Failed to transfer to grocery list");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e67e22" />
        <Text style={styles.loadingText}>Loading your weekly plan...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Meal Planner</Text>
      </View>

      <TouchableOpacity 
        style={styles.regenerateButton} 
        onPress={handleRegenerate}
        disabled={isRegenerating}
      >
        <Text style={styles.regenerateText}>
          {isRegenerating ? "Regenerating..." : "🔄 Regenerate Plan"}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {weeklyPlan.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No meal plan loaded</Text>
        </View>
      ) : (
        weeklyPlan.map((dayPlan, index) => {
          const isLocked = lockedDays.includes(dayPlan.day);
          return (
            <View key={index} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{dayPlan.day}</Text>
                <TouchableOpacity 
                  style={[styles.lockButton, isLocked && styles.lockedButton]} 
                  onPress={() => toggleLock(dayPlan.day)}
                >
                  <Text style={styles.lockText}>
                    {isLocked ? "🔒 Locked" : "🔓 Lock"}
                  </Text>
                </TouchableOpacity>
              </View>

              {['breakfast', 'lunch', 'dinner'].map(mealType => {
                const meal = dayPlan[mealType];
                if (!meal) return null;
                return (
                  <View key={mealType} style={styles.mealSection}>
                    <Text style={styles.mealType}>{mealType.toUpperCase()}</Text>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.mealDescription}>{meal.description}</Text>
                    {meal.key_nutrients && (
                      <Text style={styles.nutrients}>
                        Key nutrients: {meal.key_nutrients.join(', ')}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })
      )}

      {lockedDays.length === 7 && (
        <TouchableOpacity 
          style={styles.transferButton} 
          onPress={handleTransferToGroceryList}
        >
          <Text style={styles.transferText}>🛒 Transfer to Grocery List</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f1e9', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#3f2a1d' },
  regenerateButton: { backgroundColor: '#e67e22', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, alignSelf: 'center', marginBottom: 20 },
  regenerateText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#7f6e5d' },
  errorText: { color: '#e74c3c', textAlign: 'center', marginBottom: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 18, color: '#7f6e5d' },
  dayCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dayTitle: { fontSize: 18, fontWeight: 'bold', color: '#3f2a1d' },
  lockButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#ecf0f1' },
  lockedButton: { backgroundColor: '#27ae60' },
  lockText: { fontSize: 12, fontWeight: '600', color: '#2c3e50' },
  mealSection: { marginBottom: 12, paddingLeft: 8, borderLeftWidth: 3, borderLeftColor: '#e67e22' },
  mealType: { fontSize: 11, fontWeight: '600', color: '#e67e22', marginBottom: 4 },
  mealName: { fontSize: 16, fontWeight: '600', color: '#3f2a1d', marginBottom: 4 },
  mealDescription: { fontSize: 14, color: '#7f6e5d', marginBottom: 4 },
  nutrients: { fontSize: 12, color: '#27ae60', fontStyle: 'italic' },
  transferButton: { backgroundColor: '#27ae60', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  transferText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});