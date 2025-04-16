import React from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import { FIREBASE_AUTH } from '@/FirebaseConfig';

const fakeMovies = [
  { id: '1', title: 'The Matrix' },
  { id: '2', title: 'Inception' },
  { id: '3', title: 'Interstellar' },
];

export default function Homescreen() {
  const user = FIREBASE_AUTH.currentUser;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {user?.email}</Text>
      <Text style={styles.subheader}>Here are some movies:</Text>
      <FlatList
        data={fakeMovies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.movie}>{item.title}</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2B2C5A',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    color: '#F7EEDB',
    fontSize: 24,
    marginBottom: 10,
  },
  subheader: {
    color: '#F7D491',
    fontSize: 18,
    marginBottom: 10,
  },
  movie: {
    color: '#8BBCA6',
    fontSize: 16,
    marginVertical: 4,
  },
});