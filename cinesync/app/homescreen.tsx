import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { FIREBASE_AUTH } from '@/FirebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import MovieSearch from './MovieSearch';

export default function Homescreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const [authChecked, setAuthChecked] = useState(false);
  const user = FIREBASE_AUTH.currentUser;

  // ✅ Redirect if not logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (!user) {
        router.replace('/login');
      }
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!authChecked) return null; // wait for auth check before showing UI

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {user?.email}</Text>
      <MovieSearch groupId={groupId as string} />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={() => router.push('/groups')}>
        <Text style={styles.logoutText}>Go to Groups</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242423',
    paddingHorizontal: 20,
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
