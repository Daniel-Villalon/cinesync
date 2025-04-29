import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getDocs } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import GroupDropdownBar from '../components/GroupDropdownBar';

export default function TestGroupsScreen() {
  const [groups, setGroups] = useState<any[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = FIREBASE_AUTH;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
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
            setCurrentGroupId(fetchedGroups[0]?.id ?? null);
          }
        } catch (err) {
          console.error('Error fetching user groups:', err);
        } finally {
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#F7EEDB" />
      </SafeAreaView>
    );
  }

  if (!currentGroupId || groups.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: '#F7EEDB', textAlign: 'center', marginTop: 20 }}>No groups found.</Text>
      </SafeAreaView>
    );
  }

  const currentGroup = groups.find((g) => g.id === currentGroupId)!;

  return (
    <SafeAreaView style={styles.container}>
      <GroupDropdownBar
        groups={groups}
        currentGroup={currentGroup}
        onGroupSelect={(newGroupId) => setCurrentGroupId(newGroupId)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242423',
  },
});
