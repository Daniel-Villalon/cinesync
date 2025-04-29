// components/MovieList.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { getMovieDetails } from '@/services/MoviesService';

type MovieEntry = {
  imdbID: string;
  addedBy: string;
  addedAt: any;
};

type MovieWithDetails = MovieEntry & {
  title: string;
  poster: string;
  username: string; // ✅ Added username
};

type Props = {
  groupId: string;
};

const MovieList: React.FC<Props> = ({ groupId }) => {
  const [movies, setMovies] = useState<MovieWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    let unsubscribe: () => void;

    const fetchMovieDetails = async (movieEntries: MovieEntry[]) => {
      const detailedMovies = await Promise.all(
        movieEntries.map(async (entry) => {
          try {
            const details = await getMovieDetails(entry.imdbID);

            // ✅ Fetch the username for the addedBy user
            const userRef = doc(FIRESTORE_DB, 'users', entry.addedBy);
            const userSnap = await getDoc(userRef);

            const username = userSnap.exists() ? userSnap.data()?.username || 'Unknown' : 'Unknown';

            return {
              ...entry,
              title: details.Title || 'Untitled',
              poster: details.Poster || '',
              username: username,
            };
          } catch (err) {
            console.warn('Error fetching details for', entry.imdbID, err);
            return {
              ...entry,
              title: 'Unknown',
              poster: '',
              username: 'Unknown',
            };
          }
        })
      );
      setMovies(detailedMovies);
    };

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
            <Image
              source={{ uri: item.poster }}
              style={styles.poster}
              resizeMode="cover"
            />
            <View style={styles.infoContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.date}>
                {item.addedAt?.toDate().toLocaleDateString() || 'Unknown date'}
              </Text>
              <Text style={styles.user}>Added by {item.username}</Text> {/* ✅ Show username */}
              <Text style={styles.stars}>⭐ Rating Placeholder ⭐</Text>
            </View>
          </View>
        )}
        style={{ maxHeight: 400 }}
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
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#aaa',
    fontStyle: 'italic',
  },
});
