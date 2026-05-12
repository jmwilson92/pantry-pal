import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function SubscriptionScreen({ navigation }) {
  const handleSubscribe = (plan) => {
    Alert.alert(
      'Coming Soon!',
      `The ${plan} subscription will be available soon. Thank you for your interest!`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantry Pal Pro</Text>
      <Text style={styles.subtitle}>Unlock meal planning & smart suggestions</Text>

      {/* Monthly Plan */}
      <View style={styles.planCard}>
        <Text style={styles.planTitle}>Monthly</Text>
        <Text style={styles.price}>$4.99</Text>
        <Text style={styles.perMonth}>per month</Text>
        
        <TouchableOpacity 
          style={styles.subscribeButton} 
          onPress={() => handleSubscribe('Monthly')}
        >
          <Text style={styles.subscribeText}>Subscribe Monthly</Text>
        </TouchableOpacity>
      </View>

      {/* Yearly Plan */}
      <View style={[styles.planCard, styles.yearlyCard]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>BEST VALUE</Text>
        </View>
        <Text style={styles.planTitle}>Yearly</Text>
        <Text style={styles.price}>$47.88</Text>
        <Text style={styles.perMonth}>$3.99/month • billed yearly</Text>
        
        <TouchableOpacity 
          style={[styles.subscribeButton, styles.yearlyButton]} 
          onPress={() => handleSubscribe('Yearly')}
        >
          <Text style={styles.subscribeText}>Subscribe Yearly</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.benefitsTitle}>What you get:</Text>
      <View style={styles.benefitsList}>
        <Text style={styles.benefit}>• Weekly meal plans based on your pantry</Text>
        <Text style={styles.benefit}>• AI-powered recipe suggestions</Text>
        <Text style={styles.benefit}>• Smart shopping lists</Text>
        <Text style={styles.benefit}>• Priority support</Text>
      </View>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3f2a1d',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b5b4f',
    textAlign: 'center',
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e8d9c2',
    position: 'relative',
  },
  yearlyCard: {
    borderColor: '#22c55e',
  },
  badge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3f2a1d',
    marginBottom: 8,
  },
  price: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  perMonth: {
    fontSize: 15,
    color: '#6b5b4f',
    marginBottom: 20,
  },
  subscribeButton: {
    backgroundColor: '#22c55e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  yearlyButton: {
    backgroundColor: '#16a34a',
  },
  subscribeText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3f2a1d',
    marginTop: 20,
    marginBottom: 12,
  },
  benefitsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  benefit: {
    fontSize: 15,
    color: '#3f2a1d',
    marginBottom: 10,
    lineHeight: 22,
  },
});