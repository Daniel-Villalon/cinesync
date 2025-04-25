import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function GroupScreen() {
  const { groupId } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Group Dashboard</Text>
      <Text style={styles.groupId}>Group ID: {groupId}</Text>

      <Text style={styles.placeholder}>Coming soon: group sorting, member list, and movie preferences</Text>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace('/groups')}
      >
        <Text style={styles.backText}>← Back to Groups</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#242423', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#F7EEDB', marginBottom: 12 },
  groupId: { color: '#F7EEDB', marginBottom: 20 },
  placeholder: { color: '#aaa', fontStyle: 'italic', fontSize: 16 },
  backButton: {
    marginTop: 40,
    padding: 12,
    backgroundColor: '#555',
    borderRadius: 8,
    alignItems: 'center',
  },
  backText: { color: '#fff', fontWeight: 'bold' },
});
