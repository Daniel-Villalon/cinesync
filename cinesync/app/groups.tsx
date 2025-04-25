// app/groups.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import { useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { createGroup } from '../services/GroupService';

export default function GroupsScreen() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const user = getAuth().currentUser;

  // 🔐 Auth protection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
      }
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  // 📦 Load groups the user belongs to
  const fetchUserGroups = async () => {
    if (!user) return;

    try {
      const groupCollection = collection(FIRESTORE_DB, 'groups');
      const groupSnapshot = await getDocs(groupCollection);
      const userGroups: any[] = [];

      for (const docSnap of groupSnapshot.docs) {
        const groupId = docSnap.id;
        const memberRef = doc(FIRESTORE_DB, `groups/${groupId}/group_members/${user.uid}`);
        const memberDoc = await getDoc(memberRef);
        if (memberDoc.exists()) {
          userGroups.push({ id: groupId, ...docSnap.data() });
        }
      }

      setGroups(userGroups);
    } catch (err) {
      console.error('Error loading user groups:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Handle group creation
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Group name is required');
      return;
    }

    try {
      // const groupId = await createGroup(newGroupName.trim(), user!.uid);
      setNewGroupName('');
      Alert.alert('Group created!');
      fetchUserGroups(); // refresh
    } catch (err) {
      console.error(err);
      Alert.alert('Failed to create group');
    }
  };

  // 📍 Go to homescreen with group ID
  const handleSelectGroup = (groupId: string) => {
    router.push({ pathname: '/homescreen', params: { groupId } });
  };

  useEffect(() => {
    fetchUserGroups();
  }, []);

  if (!authChecked) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select a Group</Text>

      <Text style={styles.subheading}>Create New Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Group name..."
        placeholderTextColor="#aaa"
        value={newGroupName}
        onChangeText={setNewGroupName}
      />
      <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
        <Text style={styles.createButtonText}>Create Group</Text>
      </TouchableOpacity>

      {loading ? (
        <Text style={styles.loading}>Loading your groups...</Text>
      ) : groups.length === 0 ? (
        <Text style={styles.emptyText}>You’re not in any groups yet.</Text>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.groupItem}
              onPress={() => handleSelectGroup(item.id)}
            >
              <Text style={styles.groupText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Optional: dev-only go back */}
      <TouchableOpacity style={styles.goBackButton} onPress={() => router.replace('/login')}>
        <Text style={styles.goBackText}>← Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242423',
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F7EEDB',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 16,
    color: '#F7EEDB',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#F7D491',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: '#F7EEDB',
  },
  createButton: {
    backgroundColor: '#F5CB5C',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    fontWeight: 'bold',
    color: '#242423',
  },
  loading: {
    color: '#aaa',
    fontStyle: 'italic',
  },
  emptyText: {
    color: '#aaa',
    fontStyle: 'italic',
    marginTop: 20,
  },
  groupItem: {
    backgroundColor: '#F5CB5C',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  groupText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#242423',
  },
  goBackButton: {
    marginTop: 20,
    backgroundColor: '#999',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  goBackText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
