import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { FIREBASE_AUTH } from '@/FirebaseConfig';
import { signOut } from 'firebase/auth';
import MovieSearch from './MovieSearch';

export default function Homescreen() {
  const user = FIREBASE_AUTH.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      // onAuthStateChanged in _layout.tsx will redirect to /login
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {user?.email}</Text>
      <MovieSearch />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2B2C5A',
  },
  header: {
    color: '#F7EEDB',
    fontSize: 25,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 16,
    paddingTop: 30,
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: '#DD775C',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
