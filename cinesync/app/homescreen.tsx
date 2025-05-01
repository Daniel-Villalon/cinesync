// app/homescreen.tsx

import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import MovieSearch from './MovieSearch';
import MovieList from './movieList';
import GroupDropdownBar from './components/GroupDropdownBar';

export default function Homescreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const [authChecked, setAuthChecked] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(groupId as string);
  const user = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (!user) {
        router.replace('/login');
      }
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return;
      try {
        const userRef = doc(FIRESTORE_DB, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const groupIds = userSnap.data()?.groups || [];

        const groupDocs = await Promise.all(
          groupIds.map((id: string) => getDoc(doc(FIRESTORE_DB, 'groups', id)))
        );

        const fetchedGroups = groupDocs
          .filter(doc => doc.exists())
          .map(doc => ({
            id: doc.id,
            name: doc.data()?.name || 'Unnamed Group',
          }));

        setGroups(fetchedGroups);

        if (!currentGroupId && fetchedGroups.length > 0) {
          setCurrentGroupId(fetchedGroups[0].id);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!authChecked || (groups.length > 0 && !currentGroupId)) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#F7EEDB" />
      </SafeAreaView>
    );
  }

  const currentGroup = groups.find((g) => g.id === currentGroupId);
  if (!currentGroup) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#F7EEDB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Dropdown bar */}
      <GroupDropdownBar
        groups={groups.filter(Boolean)}
        currentGroup={currentGroup}
        onGroupSelect={(newGroupId) => {
          setCurrentGroupId(newGroupId);
          router.push({ pathname: '/homescreen', params: { groupId: newGroupId } });
        }}
      />

      {/* Main content */}
      <MovieSearch groupId={currentGroupId!} />
      <MovieList groupId={currentGroupId!} />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={() => router.push('/group')}>
        <Text style={styles.logoutText}>Go to Groups</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242423',
    paddingHorizontal: 20,
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
