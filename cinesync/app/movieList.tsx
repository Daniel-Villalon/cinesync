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

// Import your unselected icons
const thumbsUpIcon = require('@/assets/images/icons/like.png');
const thumbsDownIcon = require('@/assets/images/icons/dislike.png');

// Import your selected (yellow) icons
const thumbsUpSelectedIcon = require('@/assets/images/icons/likeSelected.png');
const thumbsDownSelectedIcon = require('@/assets/images/icons/dislikeSelected.png');

type MovieEntry = {
  imdbID: string;
  addedBy: string;
  addedAt: any;
  rating?: number;
};

type MovieWithDetails = MovieEntry & {
  title: string;
  poster: string;
  genre: string;
  username: string;
  thumbsUp: number;
  thumbsDown: number;
  userVote: 'up' | 'down' | null;
};

type Props = {
  groupId: string;
};

const MovieList: React.FC<Props> = ({ groupId }) => {
  const [movies, setMovies] = useState<MovieWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const currentUser = getAuth().currentUser;

  const fetchUserVotes = async (movieEntries: MovieEntry[]) => {
    if (!currentUser) return movieEntries;

    try {
      const movieIds = movieEntries.map(entry => entry.imdbID);
      
      const votesMap: Record<string, 'up' | 'down' | null> = {};
      
      await Promise.all(movieIds.map(async (movieId) => {
        const voteRef = doc(FIRESTORE_DB, 'userVotes', `${currentUser.uid}_${movieId}`);
        const voteSnap = await getDoc(voteRef);
        
        if (voteSnap.exists()) {
          votesMap[movieId] = voteSnap.data()?.vote || null;
        }
      }));
      
      return movieEntries.map(entry => ({
        ...entry,
        userVote: votesMap[entry.imdbID] || null
      }));
    } catch (err) {
      console.error('Error fetching user votes:', err);
      return movieEntries;
    }
  };

  const fetchMovieDetails = async (movieEntries: MovieEntry[]) => {
    const entriesWithVotes = await fetchUserVotes(movieEntries);
    
    const detailedMovies = await Promise.all(
      entriesWithVotes.map(async (entry) => {
        try {
          const details = await getMovieDetails(entry.imdbID);
          const userRef = doc(FIRESTORE_DB, 'users', entry.addedBy);
          const userSnap = await getDoc(userRef);
          const username = userSnap.exists() ? userSnap.data()?.username || 'Unknown' : 'Unknown';
          
          // Fetch vote counts
          const thumbsUpRef = collection(FIRESTORE_DB, 'movieVotes');
          const thumbsUpQuery = query(
            thumbsUpRef,
            where('movieId', '==', entry.imdbID),
            where('vote', '==', 'up')
          );
          const thumbsUpSnap = await getDocs(thumbsUpQuery);
          
          const thumbsDownRef = collection(FIRESTORE_DB, 'movieVotes');
          const thumbsDownQuery = query(
            thumbsDownRef,
            where('movieId', '==', entry.imdbID),
            where('vote', '==', 'down')
          );
          const thumbsDownSnap = await getDocs(thumbsDownQuery);

          return {
            ...entry,
            title: details.Title || 'Untitled',
            poster: details.Poster || '',
            genre: details.Genre || 'Unknown genre',
            username,
            thumbsUp: thumbsUpSnap.size,
            thumbsDown: thumbsDownSnap.size,
            userVote: (entry as any).userVote || null,
          };
        } catch (err) {
          console.warn('Error fetching details for', entry.imdbID, err);
          return {
            ...entry,
            title: 'Unknown',
            poster: '',
            genre: 'Unknown genre',
            username: 'Unknown',
            thumbsUp: 0,
            thumbsDown: 0,
            userVote: (entry as any).userVote || null,
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
    let userVotesUnsubscribe: () => void;
    let currentMovieEntries: MovieEntry[] = [];

    const setupListeners = async () => {
      try {
        const groupRef = doc(FIRESTORE_DB, 'groups', groupId);
        const groupSnap = await getDoc(groupRef);
        if (!groupSnap.exists()) return;

        const listId = groupSnap.data()?.groupList;
        if (!listId) return;

        const movieListRef = doc(FIRESTORE_DB, 'movieLists', listId);

        movieListUnsubscribe = onSnapshot(movieListRef, (docSnap) => {
          if (docSnap.exists()) {
            currentMovieEntries = docSnap.data()?.movies || [];
            fetchMovieDetails(currentMovieEntries);
          } else {
            setMovies([]);
          }
          setLoading(false);
        });

        if (currentUser) {
          const votesCollectionRef = collection(FIRESTORE_DB, 'movieVotes');
          
          const votesQuery = query(
            votesCollectionRef, 
            where('userId', '==', currentUser.uid)
          );
          
          userVotesUnsubscribe = onSnapshot(votesQuery, () => {
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
      if (userVotesUnsubscribe) userVotesUnsubscribe();
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

  const castVote = async (imdbID: string, vote: 'up' | 'down') => {
    if (!currentUser) return;
    
    try {
      const voteId = `${currentUser.uid}_${imdbID}`;
      const voteRef = doc(FIRESTORE_DB, 'movieVotes', voteId);
      
      // Check if user already voted
      const voteSnap = await getDoc(voteRef);
      
      if (voteSnap.exists()) {
        const currentVote = voteSnap.data()?.vote;
        
        // If voting the same again, remove the vote
        if (currentVote === vote) {
          await updateDoc(voteRef, { vote: null });
        } else {
          // Change vote
          await updateDoc(voteRef, { vote });
        }
      } else {
        // New vote
        await updateDoc(voteRef, {
          userId: currentUser.uid,
          movieId: imdbID,
          vote,
          timestamp: new Date()
        });
      }
    } catch (err) {
      console.error('Failed to cast vote', err);
    }
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
              <Text style={styles.genre}>{item.genre}</Text>
              <Text style={styles.user}>Added by {item.username}</Text>
              <View style={styles.votesContainer}>
                <TouchableOpacity 
                  style={styles.voteButton}
                  onPress={() => castVote(item.imdbID, 'up')}
                >
                  <Image 
                    source={item.userVote === 'up' ? thumbsUpSelectedIcon : thumbsUpIcon} 
                    style={styles.voteIcon} 
                  />
                  <Text style={[
                    styles.voteCount,
                    item.userVote === 'up' && styles.activeVoteCount
                  ]}>{item.thumbsUp}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.voteButton}
                  onPress={() => castVote(item.imdbID, 'down')}
                >
                  <Image 
                    source={item.userVote === 'down' ? thumbsDownSelectedIcon : thumbsDownIcon} 
                    style={styles.voteIcon} 
                  />
                  <Text style={[
                    styles.voteCount,
                    item.userVote === 'down' && styles.activeVoteCount
                  ]}>{item.thumbsDown}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => removeMovie(item.imdbID)}>
                <Text style={styles.remove}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        style={{ maxHeight: 725 }}
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
  genre: {
    fontSize: 14,
    color: '#F7EEDB',
    fontStyle: 'italic',
  },
  user: {
    fontSize: 14,
    color: '#F7EEDB',
  },
  votesContainer: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  voteIcon: {
    width: 24,
    height: 24,
    marginRight: 6,
  },
  voteCount: {
    color: '#F7EEDB',
    fontSize: 14,
  },
  activeVoteCount: {
    color: '#FFD700', // Yellow color to match the selected icon
    fontWeight: 'bold',
  },
  remove: {
    color: '#FF6B6B',
    marginTop: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#aaa',
  },
});