import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import MovieSearch from './MovieSearch';

export default function Homescreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const [authChecked, setAuthChecked] = useState(false);
  const [groupName, setGroupName] = useState<string | null>(null);
  const user = FIREBASE_AUTH.currentUser;

  // 🔐 Redirect if not logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (!user) {
        router.replace('/login');
      }
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  // 📦 Fetch group name
  useEffect(() => {
    const fetchGroupName = async () => {
      if (!groupId) return;
      try {
        const groupRef = doc(FIRESTORE_DB, 'groups', groupId as string);
        const groupSnap = await getDoc(groupRef);
        if (groupSnap.exists()) {
          setGroupName(groupSnap.data()?.name);
        } else {
          console.log('No such group!');
        }
      } catch (error) {
        console.error('Failed to fetch group name:', error);
      }
    };

    fetchGroupName();
  }, [groupId]);

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!authChecked) return null; // Wait for auth check before showing UI

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{groupName ? `Group: ${groupName}` : 'Loading Group...'}</Text>
      <MovieSearch />
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
