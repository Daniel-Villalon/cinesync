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
import { getPosterUrl, getMovieDetails } from '@/services/MoviesService'; // Assuming you already have OMDB API functions

type MovieEntry = {
  imdbID: string;
  addedBy: string;
  addedAt: any; // Firestore Timestamp
};

type Props = {
  groupId: string;
};

const MovieList: React.FC<Props> = ({ groupId }) => {
  const [movies, setMovies] = useState<MovieEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    const setupListener = async () => {
      try {
        const groupRef = doc(FIRESTORE_DB, 'groups', groupId);
        const groupSnap = await getDoc(groupRef);

        if (!groupSnap.exists()) {
          console.log('No such group!');
          return;
        }

        const listId = groupSnap.data()?.groupList;
        if (!listId) {
          console.log('No list ID found for this group');
          return;
        }

        const movieListRef = doc(FIRESTORE_DB, 'movieLists', listId);

        const unsubscribe = onSnapshot(movieListRef, (docSnap) => {
          if (docSnap.exists()) {
            const moviesArray = docSnap.data()?.movies || [];
            setMovies(moviesArray);
          } else {
            setMovies([]);
          }
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error setting up movie listener:', error);
      }
    };

    let unsubscribe: (() => void) | undefined;

    setupListener().then((result) => {
      unsubscribe = result;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [groupId]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} color="#F7EEDB" />;
  }

  if (movies.length === 0) {
    return <Text style={styles.emptyText}>No movies added yet.</Text>;
  }

  const renderMovieItem = ({ item }: { item: MovieEntry }) => {
    return (
      <View style={styles.movieCard}>
        {/* Movie poster */}
        <Image
          source={{ uri: getPosterUrl(item.imdbID) }}
          style={styles.poster}
          resizeMode="cover"
        />

        {/* Movie info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>Title Placeholder</Text> {/* We'll fix this later */}
          <Text style={styles.date}>
            {item.addedAt?.toDate().toLocaleDateString() || 'Unknown date'}
          </Text>
          <Text style={styles.user}>Added by {item.addedBy}</Text>

          {/* Placeholder for stars */}
          <Text style={styles.stars}>⭐ Rating Placeholder ⭐</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Watched</Text>
      <FlatList
        data={movies}
        keyExtractor={(item) => item.imdbID}
        renderItem={renderMovieItem}
        style={{ maxHeight: 400 }} // or whatever height you want
        scrollEventThrottle={16} // for smoother scrolling
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
