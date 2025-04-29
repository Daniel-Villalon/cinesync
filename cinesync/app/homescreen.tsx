import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // ✅ NEW
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { collection, getDocs } from 'firebase/firestore';
import MovieSearch from './MovieSearch';
import GroupDropdownBar from '../components/GroupDropdownBar'; // ✅ Already imported

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

        if (groupIds.length > 0) {
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
        <Text style={styles.header}>Group not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}> {/* ✅ use SafeAreaView */}
      {/* Group Dropdown at the top */}
      <GroupDropdownBar
        groups={groups}
        currentGroup={currentGroup}
        onGroupSelect={(newGroupId) => {
          setCurrentGroupId(newGroupId);
          router.push({ pathname: '/homescreen', params: { groupId: newGroupId } });
        }}
      />

      {/* Movie Search under it */}
      <MovieSearch groupId={currentGroupId} />

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* Go back to Group screen */}
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
