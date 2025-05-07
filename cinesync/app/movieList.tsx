import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getMovieDetails } from '@/services/MoviesService';

type MovieEntry = {
  imdbID: string;
  addedBy: string;
  addedAt: any;
  rating?: number; // New field
};

type MovieWithDetails = MovieEntry & {
  title: string;
  poster: string;
  username: string;
};

type Props = {
  groupId: string;
};

const MovieList: React.FC<Props> = ({ groupId }) => {
  const [movies, setMovies] = useState<MovieWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMovieDetails = async (movieEntries: MovieEntry[]) => {
    const detailedMovies = await Promise.all(
      movieEntries.map(async (entry) => {
        try {
          const details = await getMovieDetails(entry.imdbID);
          const userRef = doc(FIRESTORE_DB, 'users', entry.addedBy);
          const userSnap = await getDoc(userRef);
          const username = userSnap.exists() ? userSnap.data()?.username || 'Unknown' : 'Unknown';

          return {
            ...entry,
            title: details.Title || 'Untitled',
            poster: details.Poster || '',
            username,
            rating: entry.rating ?? 0, // Pull rating if it exists
          };
        } catch (err) {
          console.warn('Error fetching details for', entry.imdbID, err);
          return {
            ...entry,
            title: 'Unknown',
            poster: '',
            username: 'Unknown',
            rating: 0,
          };
        }
      })
    );
    const sortedMovies = detailedMovies.sort(
      (a, b) => a.addedAt?.toDate?.() - b.addedAt?.toDate?.()
    );
    setMovies(sortedMovies);
  };

  useEffect(() => {
    if (!groupId) return;

    let unsubscribe: () => void;

    const setupListener = async () => {
      try {
        const groupRef = doc(FIRESTORE_DB, 'groups', groupId);
        const groupSnap = await getDoc(groupRef);
        if (!groupSnap.exists()) return;

        const listId = groupSnap.data()?.groupList;
        if (!listId) return;

        const movieListRef = doc(FIRESTORE_DB, 'movieLists', listId);

        unsubscribe = onSnapshot(movieListRef, (docSnap) => {
          if (docSnap.exists()) {
            const rawMovies = docSnap.data()?.movies || [];
            fetchMovieDetails(rawMovies);
          } else {
            setMovies([]);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error setting up movie listener:', error);
      }
    };

    setupListener();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [groupId]);

  const removeMovie = async (imdbID: string) => {
    try {
      const groupRef = doc(FIRESTORE_DB, 'groups', groupId);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) return;

      const listId = groupSnap.data()?.groupList;
      if (!listId) return;

      const movieListRef = doc(FIRESTORE_DB, 'movieLists', listId);
      const movieDoc = await getDoc(movieListRef);
      if (!movieDoc.exists()) return;

      const currentMovies: MovieEntry[] = movieDoc.data()?.movies || [];
      const updatedMovies = currentMovies.filter((m) => m.imdbID !== imdbID);

      await updateDoc(movieListRef, { movies: updatedMovies });
    } catch (err) {
      console.error('Failed to remove movie', err);
    }
  };

  const renderStars = (rating: number) => {
    const fullStar = '★';
    const emptyStar = '☆';
    const rounded = Math.round(rating);
    return fullStar.repeat(rounded) + emptyStar.repeat(5 - rounded);
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} color="#F7EEDB" />;
  }

  if (movies.length === 0) {
    return <Text style={styles.emptyText}>No movies added yet.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Watchlist</Text>
      <FlatList
        data={movies}
        keyExtractor={(item) => item.imdbID}
        renderItem={({ item }) => (
          <View style={styles.movieCard}>
            <TouchableOpacity onPress={() => router.push(`/MovieDetails/${item.imdbID}/${groupId}`)}>
              <Image source={{ uri: item.poster }} style={styles.poster} resizeMode="cover" />
            </TouchableOpacity>
            <View style={styles.infoContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.date}>
                {item.addedAt?.toDate().toLocaleDateString() || 'Unknown date'}
              </Text>
              <Text style={styles.user}>Added by {item.username}</Text>
              <Text style={styles.stars}>{renderStars(item.rating || 0)}</Text>
              <TouchableOpacity onPress={() => removeMovie(item.imdbID)}>
                <Text style={styles.remove}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        style={{ maxHeight: 700 }}
        scrollEventThrottle={16}
      />
    </View>
  );
};

export default MovieList;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F7EEDB',
    marginBottom: 8,
  },
  movieCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  poster: {
    width: 100,
    height: 150,
    backgroundColor: '#333',
  },
  infoContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    color: '#F7EEDB',
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#F7EEDB',
  },
  user: {
    fontSize: 14,
    color: '#F7EEDB',
  },
  stars: {
    fontSize: 16,
    color: '#FFD700',
    marginTop: 8,
  },
  remove: {
    color: '#FF6B6B',
    marginTop: 8,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#aaa',
  },
});
