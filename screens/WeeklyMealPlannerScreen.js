import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getGrokWeeklyPlan } from '../utils/grokService';
import { addToGroceryList } from '../utils/groceryStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WeeklyMealPlannerScreen() {
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lockedDays, setLockedDays] = useState([]);
  const navigation = useNavigation();
  const { user } = useAuth();

  // Load plan only once when screen opens (no auto-regenerate)
  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const savedPlan = await AsyncStorage.getItem('weeklyPlan');
      if (savedPlan) {
        setPlan(JSON.parse(savedPlan));
      } else {
        const newPlan = await getGrokWeeklyPlan();
        setPlan(newPlan);
        await AsyncStorage.setItem('weeklyPlan', JSON.stringify(newPlan));
      }
    } catch (error) {
      console.error('Error loading plan:', error);
      Alert.alert('Error', 'Could not load meal plan');
    }
    setLoading(false);
  };

  const regeneratePlan = async () => {
    setLoading(true);
    try {
      const newPlan = await getGrokWeeklyPlan();
      
      // Keep locked days, replace unlocked ones
      const updatedPlan = plan.map((dayPlan, index) => {
        if (lockedDays.includes(index)) {
          return dayPlan; // Keep locked
        } else {
          return newPlan[index] || dayPlan; // Replace unlocked
        }
      });
      
      setPlan(updatedPlan);
      await AsyncStorage.setItem('weeklyPlan', JSON.stringify(updatedPlan));
    } catch (error) {
      console.error('Error regenerating plan:', error);
      Alert.alert('Error', 'Could not regenerate plan');
    }
    setLoading(false);
  };

  const toggleLock = (index) => {
    if (lockedDays.includes(index)) {
      setLockedDays(lockedDays.filter(i => i !== index));
    } else {
      setLockedDays([...lockedDays, index]);
    }
  };

  const transferToGroceryList = async () => {
    if (lockedDays.length !== 7) {
      Alert.alert('Lock all days first', 'Please lock all 7 days before transferring to grocery list');
      return;
    }

    const allIngredients = [];
    plan.forEach(day => {
      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const meal = day[mealType];
        if (meal && meal.ingredients) {
          meal.ingredients.forEach(ing => {
            allIngredients.push({
              name: ing,
              quantity: '1',
              unit: 'serving',
              fromMeal: `${day.day} - ${mealType}`
            });
          });
        }
      });
    });

    await addToGroceryList(allIngredients);
    Alert.alert('Success!', 'All ingredients transferred to your Smart Grocery List!');
    navigation.navigate('GroceryList');
  };

  const allLocked = lockedDays.length === 7;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Meal Planner</Text>
        <TouchableOpacity onPress={regeneratePlan} style={styles.regenerateButton}>
          <Text style={styles.regenerateText}>🔄 Regenerate</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {plan.map((dayPlan, index) => (
          <View key={index} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{dayPlan.day}</Text>
              <TouchableOpacity 
                onPress={() => toggleLock(index)}
                style={[styles.lockButton, lockedDays.includes(index) && styles.lockedButton]}
              >
                <Text style={styles.lockText}>
                  {lockedDays.includes(index) ? '🔒 Locked' : '🔓 Lock'}
                </Text>
              </TouchableOpacity>
            </View>

            {['breakfast', 'lunch', 'dinner'].map(mealType => (
              <View key={mealType} style={styles.mealRow}>
                <Text style={styles.mealType}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                <Text style={styles.mealName}>{dayPlan[mealType]?.name}</Text>
                <Text style={styles.mealDesc}>{dayPlan[mealType]?.description}</Text>
                {dayPlan[mealType]?.key_nutrients && (
                  <Text style={styles.nutrients}>
                    Key nutrients: {dayPlan[mealType].key_nutrients.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {allLocked && (
        <TouchableOpacity 
          style={styles.transferButton}
          onPress={transferToGroceryList}
        >
          <Text style={styles.transferText}>🛒 Transfer to Grocery List</Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Pantry Pro is planning your week...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f1e9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#3f2a1d' },
  regenerateButton: { backgroundColor: '#e67e22', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  regenerateText: { color: '#fff', fontWeight: '600' },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  dayCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dayTitle: { fontSize: 20, fontWeight: 'bold', color: '#3f2a1d' },
  lockButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f0f0f0' },
  lockedButton: { backgroundColor: '#27ae60' },
  lockText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  mealRow: { marginBottom: 12 },
  mealType: { fontSize: 14, fontWeight: '600', color: '#e67e22', marginBottom: 2 },
  mealName: { fontSize: 16, fontWeight: '600', color: '#3f2a1d' },
  mealDesc: { fontSize: 14, color: '#666', marginTop: 4 },
  nutrients: { fontSize: 12, color: '#27ae60', marginTop: 4, fontStyle: 'italic' },
  transferButton: { backgroundColor: '#27ae60', margin: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  transferText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});