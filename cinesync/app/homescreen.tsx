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
    backgroundColor: '#242423', // dark greyr
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#E8EDDF',
    marginTop: -40,
    fontFamily: 'Georgia',
  },
  tagline: {
    fontSize: 16,
    color: '#E8EDDF',
    marginBottom: 40,
    marginTop: 8,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: '#E8EDDF',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 20,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  signUpButton: {
    backgroundColor: '#F5CB5C',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#242423',
    fontWeight: '600',
  },
  header: {
    color: '#F7EEDB',
    fontSize: 25,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 16,
    paddingTop: 20,
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: '#DD775C',
    paddingVertical: 12,
    borderRadius: 12,
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