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
import { doc, getDoc, onSnapshot, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getMovieDetails } from '@/services/MoviesService';
import { getAuth } from 'firebase/auth';

type MovieEntry = {
  imdbID: string;
  addedBy: string;
  addedAt: any;
  rating?: number;
};

type MovieWithDetails = MovieEntry & {
  title: string;
  poster: string;
  username: string;
  userRating: number; // Added userRating field to store the logged-in user's rating
};

type Props = {
  groupId: string;
};

const MovieList: React.FC<Props> = ({ groupId }) => {
  const [movies, setMovies] = useState<MovieWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const currentUser = getAuth().currentUser;

  const fetchUserRatings = async (movieEntries: MovieEntry[]) => {
    // Only fetch ratings if we have a logged-in user
    if (!currentUser) return movieEntries;

    try {
      // Get all movie IDs we need to fetch ratings for
      const movieIds = movieEntries.map(entry => entry.imdbID);
      
      // Create a map to store ratings by movie ID
      const ratingsMap: Record<string, number> = {};
      
      // Fetch ratings for each movie
      await Promise.all(movieIds.map(async (movieId) => {
        const ratingRef = doc(FIRESTORE_DB, 'userRatings', `${currentUser.uid}_${movieId}`);
        const ratingSnap = await getDoc(ratingRef);
        
        if (ratingSnap.exists()) {
          ratingsMap[movieId] = ratingSnap.data()?.rating || 0;
        }
      }));
      
      // Return the movie entries with ratings added
      return movieEntries.map(entry => ({
        ...entry,
        userRating: ratingsMap[entry.imdbID] || 0
      }));
    } catch (err) {
      console.error('Error fetching user ratings:', err);
      return movieEntries;
    }
  };

  const fetchMovieDetails = async (movieEntries: MovieEntry[]) => {
    // First fetch user ratings for these movies
    const entriesWithRatings = await fetchUserRatings(movieEntries);
    
    const detailedMovies = await Promise.all(
      entriesWithRatings.map(async (entry) => {
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
            rating: entry.rating ?? 0,
            userRating: (entry as any).userRating || 0, // Include the user's personal rating
          };
        } catch (err) {
          console.warn('Error fetching details for', entry.imdbID, err);
          return {
            ...entry,
            title: 'Unknown',
            poster: '',
            username: 'Unknown',
            rating: 0,
            userRating: (entry as any).userRating || 0,
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

    let movieListUnsubscribe: () => void;
    let userRatingsUnsubscribe: () => void;
    let currentMovieEntries: MovieEntry[] = [];

    const setupListeners = async () => {
      try {
        const groupRef = doc(FIRESTORE_DB, 'groups', groupId);
        const groupSnap = await getDoc(groupRef);
        if (!groupSnap.exists()) return;

        const listId = groupSnap.data()?.groupList;
        if (!listId) return;

        const movieListRef = doc(FIRESTORE_DB, 'movieLists', listId);

        // Listen for changes to the movie list
        movieListUnsubscribe = onSnapshot(movieListRef, (docSnap) => {
          if (docSnap.exists()) {
            currentMovieEntries = docSnap.data()?.movies || [];
            fetchMovieDetails(currentMovieEntries);
          } else {
            setMovies([]);
          }
          setLoading(false);
        });

        // Set up a listener for the user's ratings if user is logged in
        if (currentUser) {
          // Create a collection reference for userRatings
          const ratingsCollectionRef = collection(FIRESTORE_DB, 'userRatings');
          
          // Query for documents where the userId matches the current user
          const ratingsQuery = query(
            ratingsCollectionRef, 
            where('userId', '==', currentUser.uid)
          );
          
          // Listen for changes to any of the user's ratings
          userRatingsUnsubscribe = onSnapshot(ratingsQuery, () => {
            // When ratings change, refetch movie details with updated ratings
            if (currentMovieEntries.length > 0) {
              fetchMovieDetails(currentMovieEntries);
            }
          });
        }
      } catch (error) {
        console.error('Error setting up listeners:', error);
      }
    };

    setupListeners();
    
    return () => {
      if (movieListUnsubscribe) movieListUnsubscribe();
      if (userRatingsUnsubscribe) userRatingsUnsubscribe();
    };
  }, [groupId, currentUser?.uid]);

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
              {item.userRating > 0 && (
                <View>
                  <Text style={styles.ratingLabel}>Your Rating:</Text>
                  <Text style={styles.stars}>{renderStars(item.userRating)}</Text>
                </View>
              )}
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
  ratingLabel: {
    fontSize: 14,
    color: '#F7EEDB',
    marginTop: 8,
  },
  stars: {
    fontSize: 16,
    color: '#FFD700',
    marginTop: 2,
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