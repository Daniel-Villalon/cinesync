//MovieSearch.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import debounce from 'lodash.debounce';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { searchMovies, MovieSummary } from '../services/MoviesService';
import { DismissKeyboardView } from '../services/DismissKeyboardView';
import {
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FIRESTORE_DB } from '@/FirebaseConfig';

const MovieSearch = () => {
  const { groupId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MovieSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlistStatus, setWatchlistStatus] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  const db = FIRESTORE_DB;

  const debouncedSearch = useMemo(
    () =>
      debounce(async (text: string) => {
        if (!text.trim()) {
          setResults([]);
          setError(null);
          return;
        }
        setLoading(true);
        setError(null);
        try {
          const res = await searchMovies(text);
          setResults(res);
          checkWatchlistStatuses(res);
        } catch (err: any) {
          setError(err.message || 'Error fetching movies');
        } finally {
          setLoading(false);
        }
      }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query]);

  const checkWatchlistStatuses = async (movies: MovieSummary[]) => {
    const user = getAuth().currentUser;
    if (!user || !groupId) return;

    try {
      const groupRef = doc(db, 'groups', groupId as string);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) return;

      const listId = groupSnap.data()?.groupList;
      if (!listId) return;

      const movieListRef = doc(db, 'movieLists', listId);
      const listSnap = await getDoc(movieListRef);
      if (!listSnap.exists()) return;

      const currentMovies: any[] = listSnap.data()?.movies || [];
      const statusMap: { [key: string]: boolean } = {};

      movies.forEach((m) => {
        statusMap[m.imdbID] = currentMovies.some((cm) => cm.imdbID === m.imdbID);
      });

      setWatchlistStatus(statusMap);
    } catch (err) {
      console.error('Error checking watchlist:', err);
    }
  };

  const toggleWatchlistStatus = async (imdbID: string) => {
    const user = getAuth().currentUser;
    if (!user || !groupId) return;

    try {
      const groupRef = doc(db, 'groups', groupId as string);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) return;

      const listId = groupSnap.data()?.groupList;
      if (!listId) return;

      const movieListRef = doc(db, 'movieLists', listId);
      const listSnap = await getDoc(movieListRef);

      const currentMovies: any[] = listSnap.exists() ? listSnap.data()?.movies || [] : [];
      const alreadyInList = currentMovies.some((m) => m.imdbID === imdbID);

      let updatedMovies;
      if (alreadyInList) {
        updatedMovies = currentMovies.filter((m) => m.imdbID !== imdbID);
      } else {
        updatedMovies = [...currentMovies, { imdbID, addedBy: user.uid }];
      }

      await setDoc(movieListRef, {
        groupId,
        createdAt: listSnap.exists() ? listSnap.data()?.createdAt : new Date(),
        movies: updatedMovies,
      });

      setWatchlistStatus((prev) => ({
        ...prev,
        [imdbID]: !alreadyInList,
      }));
    } catch (err) {
      console.error('Error toggling watchlist:', err);
    }
  };

  const openDetails = (imdbID: string) => {
    router.push(`/MovieDetails/${imdbID}/${groupId}`);
  };

  if (!groupId) {
    return <Text style={{ color: 'red', padding: 20 }}>Group ID is missing or invalid.</Text>;
  }

  return (
    <DismissKeyboardView style={[styles.safe, { paddingTop: 15 }]}>
      <Text style={styles.heading}>Add to list</Text>
      <TextInput
        style={styles.input}
        placeholder="Start typing a movie title…"
        placeholderTextColor="#aaa"
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />

      {loading && <ActivityIndicator style={{ marginTop: 12 }} color="#F7EEDB" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={results}
        keyExtractor={(item) => item.imdbID}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity onPress={() => openDetails(item.imdbID)} style={{ flex: 1 }}>
              <Text style={styles.title}>
                {item.Title} ({item.Year})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleWatchlistStatus(item.imdbID)}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>
                {watchlistStatus[item.imdbID] ? '➖' : '➕'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
      />
    </DismissKeyboardView>
  );
};

export default MovieSearch;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#242423' },
  heading: {
    fontSize: 24,
    color: '#F7EEDB',
    marginHorizontal: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#F7D491',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    color: '#F7EEDB',
  },
  errorText: { color: '#FF5555', marginTop: 12, textAlign: 'center' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    marginHorizontal: 16,
  },
  title: { fontSize: 18, color: '#F7EEDB' },
  addButton: {
    marginLeft: 10,
    padding: 4,
  },
  addButtonText: {
    fontSize: 22,
    color: '#F7EEDB',
  },
});
