// app/MovieDetails/[imdbID].tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  getMovieDetails,
  getPosterUrl,
  MovieDetails as MD,
} from '../../services/omdbApi';

// map OMDb source names to shorter labels
const SOURCE_LABELS: Record<string,string> = {
  'Internet Movie Database': 'IMDb',
  'Rotten Tomatoes':           'Rotten Tomatoes',
  'Metacritic':                'Metacritic',
};


export default function MovieDetailsScreen() {
  const { imdbID } = useLocalSearchParams<{ imdbID: string }>();
  const [movie, setMovie] = useState<MD | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imdbID) return;
    getMovieDetails(imdbID)
      .then((m) => setMovie(m))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [imdbID]);

  if (loading) {
    return <ActivityIndicator style={styles.centered} color="#F7EEDB" />;
  }
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  if (!movie) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Movie not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={{ uri: getPosterUrl(movie.imdbID) }}
          style={styles.poster}
          resizeMode="contain"
        />
        <Text style={styles.title}>{movie.Title}</Text>
        <Text style={styles.info}>Year: {movie.Year}</Text>
        <Text style={styles.info}>Genre: {movie.Genre}</Text>

        {/* Ratings */}
        {movie.Ratings && movie.Ratings.length > 0 && (
          <View style={styles.ratingsContainer}>
            <Text style={styles.sectionHeading}>Ratings</Text>
            {movie.Ratings.map((r) => (
              <Text key={r.Source} style={styles.ratingText}>
                {r.Source}: {r.Value}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.plot}>{movie.Plot}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#2B2C5A',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2B2C5A',
  },
  content: {
    padding: 16,
  },
  poster: {
    width: '100%',
    height: 400,
    marginBottom: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F7EEDB',
    marginBottom: 8,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#F7EEDB',
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F7EEDB',
    marginTop: 16,
    marginBottom: 4,
  },
  ratingsContainer: {
    marginTop: 12,
  },
  ratingText: {
    fontSize: 14,
    color: '#F7EEDB',
    marginBottom: 2,
  },
  plot: {
    fontSize: 14,
    color: '#F7EEDB',
    marginTop: 12,
    textAlign: 'justify',
  },
  errorText: {
    color: '#FF5555',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
});
