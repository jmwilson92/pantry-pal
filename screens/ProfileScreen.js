import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { deleteUser } from 'firebase/auth';
import { auth } from '../firebase';

export default function ProfileScreen({ navigation }) {
  const { currentUser, logout } = useAuth();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This will permanently delete your account and all your pantry data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(auth.currentUser);
              Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. You may need to re-authenticate.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.email}>{currentUser?.email}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.deleteText}>Delete Account</Text>
      </TouchableOpacity>

      <Text style={styles.warning}>Deleting your account will permanently remove all your data.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f1e9',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3f2a1d',
    textAlign: 'center',
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e8d9c2',
  },
  label: {
    fontSize: 14,
    color: '#6b5b4f',
    marginBottom: 6,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3f2a1d',
  },
  logoutButton: {
    backgroundColor: '#e8d9c2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutText: {
    color: '#3f2a1d',
    fontSize: 17,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  warning: {
    color: '#6b5b4f',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});