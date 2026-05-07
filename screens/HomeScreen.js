import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🥬 Pantry Pal</Text>
      <Text style={styles.subtitle}>Track your groceries • Reduce waste</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Scan New Item" onPress={() => navigation.navigate('Scan')} />
        <Button title="View Inventory" onPress={() => navigation.navigate('Inventory')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginTop: 50 },
  subtitle: { fontSize: 18, textAlign: 'center', marginVertical: 10, color: '#666' },
  buttonContainer: { marginTop: 40, gap: 15 }
});
