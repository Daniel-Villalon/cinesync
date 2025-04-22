// components/MovieSearch.tsx

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import debounce from 'lodash.debounce';
import { useRouter } from 'expo-router';
import { searchMovies, MovieSummary } from '../services/MoviesService';

const MovieSearch: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<MovieSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const router                = useRouter();

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

  const openDetails = (imdbID: string) => {
    router.push(`/MovieDetails/${imdbID}`);
  };

  return (
    <View style={[styles.safe, { paddingTop: 15 }]}>
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
      {error   && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={results}
        keyExtractor={item => item.imdbID}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => openDetails(item.imdbID)}
          >
            <Text style={styles.title}>{item.Title} ({item.Year})</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

export default MovieSearch;

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#242423'},
  heading:   { fontSize: 24, color: '#F7EEDB', marginHorizontal: 16, marginBottom: 8, textAlign: 'center', fontWeight: 'bold'},
  input:     {
    borderWidth: 1,
    borderColor: '#F7D491',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    color: '#F7EEDB',
  },
  errorText: { color: '#FF5555', marginTop: 12, textAlign: 'center' },
  item:      {
    paddingVertical:   12,
    borderBottomWidth: 1,
    borderBottomColor:'#444',
    marginHorizontal:  16,
  },
  title:     { fontSize: 18, color: '#F7EEDB' },
});
