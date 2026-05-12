import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { getGrokWeeklyPlan } from '../utils/grokService';

export default function WeeklyMealPlannerScreen() {
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [lockedDays, setLockedDays] = useState([]);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const weeklyPlan = await getGrokWeeklyPlan();
      // Keep locked days, only replace unlocked ones
      const newPlan = weeklyPlan.map((day, index) => {
        if (lockedDays.includes(day.day)) {
          return plan[index] || day; // keep old locked
        }
        return day;
      });
      setPlan(newPlan.length > 0 ? newPlan : weeklyPlan);
    } catch (error) {
      console.error('Error generating weekly plan:', error);
      setPlan([]);
    }
    setLoading(false);
  };

  const toggleLock = (dayName) => {
    if (lockedDays.includes(dayName)) {
      setLockedDays(lockedDays.filter(d => d !== dayName));
    } else {
      setLockedDays([...lockedDays, dayName]);
    }
  };

  const openDayModal = (day) => {
    setSelectedDay(day);
    setShowModal(true);
  };

  useEffect(() => {
    generatePlan();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Meal Planner</Text>
        <TouchableOpacity onPress={generatePlan} style={styles.regenerateButton}>
          <Text style={styles.regenerateText}>Regenerate</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e67e22" />
          <Text style={styles.loadingText}>Pantry Pro is creating your weekly plan...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {plan.map((day, index) => (
            <View key={index} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{day.day}</Text>
                <TouchableOpacity onPress={() => toggleLock(day.day)}>
                  <Text style={styles.lockButton}>{lockedDays.includes(day.day) ? '🔒 Locked' : '🔓 Lock'}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => openDayModal(day)}>
                <Text style={styles.daySummary}>
                  {day.breakfast?.name} • {day.lunch?.name} • {day.dinner?.name}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedDay?.day}</Text>
            
            <View style={styles.mealSection}>
              <Text style={styles.mealType}>Breakfast</Text>
              <Text style={styles.mealName}>{selectedDay?.breakfast?.name}</Text>
              <Text style={styles.mealDesc}>{selectedDay?.breakfast?.description}</Text>
              <Text style={styles.nutrients}>Key nutrients: {Array.isArray(selectedDay?.breakfast?.key_nutrients) ? selectedDay.breakfast.key_nutrients.join(', ') : selectedDay?.breakfast?.key_nutrients}</Text>
            </View>

            <View style={styles.mealSection}>
              <Text style={styles.mealType}>Lunch</Text>
              <Text style={styles.mealName}>{selectedDay?.lunch?.name}</Text>
              <Text style={styles.mealDesc}>{selectedDay?.lunch?.description}</Text>
              <Text style={styles.nutrients}>Key nutrients: {Array.isArray(selectedDay?.lunch?.key_nutrients) ? selectedDay.lunch.key_nutrients.join(', ') : selectedDay?.lunch?.key_nutrients}</Text>
            </View>

            <View style={styles.mealSection}>
              <Text style={styles.mealType}>Dinner</Text>
              <Text style={styles.mealName}>{selectedDay?.dinner?.name}</Text>
              <Text style={styles.mealDesc}>{selectedDay?.dinner?.description}</Text>
              <Text style={styles.nutrients}>Key nutrients: {Array.isArray(selectedDay?.dinner?.key_nutrients) ? selectedDay.dinner.key_nutrients.join(', ') : selectedDay?.dinner?.key_nutrients}</Text>
            </View>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
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
  dayCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayTitle: { fontSize: 20, fontWeight: '700', color: '#3f2a1d', marginBottom: 8 },
  lockButton: { fontSize: 12, color: '#e67e22', fontWeight: '600' },
  daySummary: { fontSize: 14, color: '#7f6e5d' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, width: '90%', maxHeight: '85%', padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#3f2a1d', marginBottom: 16, textAlign: 'center' },
  mealSection: { marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  mealType: { fontSize: 14, fontWeight: '600', color: '#e67e22', marginBottom: 4 },
  mealName: { fontSize: 17, fontWeight: '700', color: '#3f2a1d', marginBottom: 6 },
  mealDesc: { fontSize: 14, color: '#7f6e5d', lineHeight: 20, marginBottom: 6 },
  nutrients: { fontSize: 13, color: '#27ae60', fontStyle: 'italic' },
  closeButton: { backgroundColor: '#e67e22', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  closeButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});