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

  // ✅ Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
      }
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  // 🔁 Fetch all groups where this user is a member
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

  // ➕ Create a new group and auto-add user to it
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Group name is required');
      return;
    }

    try {
      const groupId = await createGroup(newGroupName.trim(), user!.uid);
      setNewGroupName('');
      Alert.alert('Group created!');
      fetchUserGroups(); // refresh list
    } catch (err) {
      console.error(err);
      Alert.alert('Failed to create group');
    }
  };

  // 🎯 Navigate to homescreen with selected group ID
  const handleSelectGroup = (groupId: string) => {
    router.push({ pathname: '/homescreen', params: { groupId } });
  };

  // 🔁 Load groups on mount
  useEffect(() => {
    fetchUserGroups();
  }, []);

  if (!authChecked) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select a Group</Text>

      {/* Create group form */}
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

      {/* Show group list */}
      {loading ? (
        <Text style={styles.loading}>Loading your groups...</Text>
      ) : groups.length === 0 ? (
        <Text style={styles.emptyText}>You’re not in any groups yet.</Text>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.groupBlock}>
              <TouchableOpacity
                style={styles.groupItem}
                onPress={() => handleSelectGroup(item.id)}
              >
                <Text style={styles.groupText}>{item.name}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push(`/InviteUser?groupId=${item.id}`)}>
                <Text style={styles.inviteLink}>+ Invite</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Global View Invites button */}
      <TouchableOpacity onPress={() => router.push(`/PendingInvites`)}>
        <Text style={styles.viewInvites}>📬 View My Invites</Text>
      </TouchableOpacity>

      {/* Dev: go back to login */}
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
  groupBlock: {
    marginBottom: 16,
    backgroundColor: '#F5CB5C',
    borderRadius: 8,
    padding: 12,
  },
  groupItem: {
    paddingBottom: 4,
  },
  groupText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#242423',
  },
  inviteLink: {
    color: '#242423',
    fontWeight: 'bold',
    marginTop: 4,
  },
  viewInvites: {
    color: '#F7EEDB',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
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