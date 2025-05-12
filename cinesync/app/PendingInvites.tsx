import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { addUserToGroup } from '@/services/GroupService';
import { onAuthStateChanged } from 'firebase/auth';

export default function PendingInvites() {
  const [invites, setInvites] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Wait for auth to fully initialize
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 🔁 Fetch invites when user is loaded
  useEffect(() => {
    if (!user?.email) return;

    const fetchInvites = async () => {
      console.log('Fetching invites for', user.email);
      const q = query(
        collection(FIRESTORE_DB, 'invites'),
        where('email', '==', user.email),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Found invites:', results);
      setInvites(results);
    };

    fetchInvites();
  }, [user]);

  const acceptInvite = async (invite: any) => {
    try {
      await addUserToGroup(invite.groupId, user.uid);
      await deleteDoc(doc(FIRESTORE_DB, 'invites', invite.id));
      Alert.alert('Success', 'You have joined the group!');
      setInvites(invites.filter(i => i.id !== invite.id));
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not join group');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#F7EEDB" size="large" />
      </View>
    );
  }
  const declineInvite = async (invite: any) => {
    try {
      await deleteDoc(doc(FIRESTORE_DB, 'invites', invite.id));
      Alert.alert('Success', 'You have decline the invite');
      setInvites(invites.filter(i => i.id !== invite.id));
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not decline group')
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Invites</Text>

      {invites.length === 0 ? (
        <Text style={{ color: '#aaa', marginTop: 16 }}>You have no pending invites.</Text>
      ) : (
        <FlatList
          data={invites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.inviteItem}>
              <TouchableOpacity style={styles.declineContainer} onPress={() => declineInvite(item)}> 
                <Text style={styles.declineText}>X</Text>
              </TouchableOpacity>
              <Text style={styles.text}>Group ID: {item.groupId}</Text>
              <Button title="Accept Invite" onPress={() => acceptInvite(item)} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#242423', flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#F7EEDB', marginBottom: 10 },
  inviteItem: {
    padding: 12,
    backgroundColor: '#333',
    marginBottom: 10,
    borderRadius: 8,
  },
  declineContainer: {
    elevation: 2,
    position: 'absolute',
    right: 10,
    cursor: 'pointer',
    zIndex: 1,
  },
  declineText: {
    color: '#F7EEDB',
  },
  text: { 
    color: '#F7EEDB',
    marginBottom: 4, 
  },
});