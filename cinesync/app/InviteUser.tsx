// app/InviteUser.tsx
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function InviteUser() {
  const { groupId } = useLocalSearchParams();
  const [email, setEmail] = useState('');

  const handleInvite = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user || !email) {
      Alert.alert('Error', 'You must be logged in and enter an email.');
      return;
    }

    try {
      await addDoc(collection(FIRESTORE_DB, 'invites'), {
        email,
        groupId,
        sentBy: user.uid,
        sentAt: serverTimestamp(),
        status: 'pending',
      });
      Alert.alert('Success', `Invite sent to ${email}`);
      setEmail('');
    } catch (err) {
      console.error(err);
      Alert.alert('Error sending invite');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Invite someone to join this group</Text>
      <TextInput
        style={styles.input}
        placeholder="user@example.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Button title="Send Invite" onPress={handleInvite} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#242423' },
  label: { color: '#F7EEDB', fontSize: 18, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#F5CB5C',
    color: '#F7EEDB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
});
