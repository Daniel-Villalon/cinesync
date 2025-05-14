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
  Alert,
} from 'react-native';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import { doc, getDoc, onSnapshot, updateDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { getMovieDetails } from '@/services/MoviesService';
import { getAuth } from 'firebase/auth';

// Import your unselected icons
const thumbsUpIcon = require('@/assets/images/icons/like.png');
const thumbsDownIcon = require('@/assets/images/icons/dislike.png');
// Import your selected (yellow) icons
const thumbsUpSelectedIcon = require('@/assets/images/icons/likeSelected.png');
const thumbsDownSelectedIcon = require('@/assets/images/icons/dislikeSelected.png');
// Import seen/not seen icons
const seenIcon = require('@/assets/images/icons/seen.png');
const notSeenIcon = require('@/assets/images/icons/notSeen.png');

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
  seen: boolean; // Added seen property
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
      const seenMap: Record<string, boolean> = {};
      
      await Promise.all(movieIds.map(async (movieId) => {
        // Include groupId in the vote reference to make votes group-specific
        const voteRef = doc(FIRESTORE_DB, 'movieVotes', `${currentUser.uid}_${movieId}_${groupId}`);
        const voteSnap = await getDoc(voteRef);
        if (voteSnap.exists()) {
          votesMap[movieId] = voteSnap.data()?.vote || null;
          seenMap[movieId] = voteSnap.data()?.seen || false;
        } else {
          seenMap[movieId] = false;
        }
      }));
      
      return movieEntries.map(entry => ({
        ...entry,
        userVote: votesMap[entry.imdbID] || null,
        seen: seenMap[entry.imdbID] || false
      }));
    } catch (err) {
      console.error('Error fetching user votes:', err);
      return movieEntries;
    }
  };

  const fetchMovieDetails = async (movieEntries: MovieEntry[]) => {
    const entriesWithVotes = await fetchUserVotes(movieEntries);
    const groupSnap = await getDoc(doc(FIRESTORE_DB, 'groups', groupId));
    const sortBy = groupSnap.exists() ? groupSnap.data()?.sortBy : null;
  
    // Get all votes in this group
    const votesQuery = query(
      collection(FIRESTORE_DB, 'movieVotes'),
      where('groupId', '==', groupId)
    );
    const voteSnapshots = await getDocs(votesQuery);
  
    const voteCounts: Record<string, { up: number; down: number }> = {};
    const usernames: Record<string, string> = {}; // Cache usernames
  
    voteSnapshots.forEach((snap) => {
      const { movieId, vote } = snap.data();
      if (!voteCounts[movieId]) voteCounts[movieId] = { up: 0, down: 0 };
      if (vote === 'up') voteCounts[movieId].up += 1;
      else if (vote === 'down') voteCounts[movieId].down += 1;
    });
  
    const detailedMovies = await Promise.all(
      entriesWithVotes.map(async (entry) => {
        try {
          const details = await getMovieDetails(entry.imdbID);
          const voteStat = voteCounts[entry.imdbID] || { up: 0, down: 0 };
  
          // Get username, caching results
          let username = usernames[entry.addedBy];
          if (!username) {
            const userSnap = await getDoc(doc(FIRESTORE_DB, 'users', entry.addedBy));
            username = userSnap.exists() ? userSnap.data()?.username || 'Unknown' : 'Unknown';
            usernames[entry.addedBy] = username;
          }
  
          return {
            ...entry,
            title: details.Title || 'Untitled',
            poster: details.Poster || '',
            genre: details.Genre || 'Unknown genre',
            username,
            thumbsUp: voteStat.up,
            thumbsDown: voteStat.down,
            userVote: (entry as any).userVote || null,
            seen: (entry as any).seen || false,
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
            seen: (entry as any).seen || false,
          };
        }
      })
    );
  
    const sortedMovies = sortBy === 'Liked'
      ? detailedMovies.sort((a, b) =>
          (b.thumbsUp - b.thumbsDown) - (a.thumbsUp - a.thumbsDown)
        )
      : detailedMovies.sort(
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
            where('userId', '==', currentUser.uid),
            where('groupId', '==', groupId) // Only listen for votes in this group
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
      Alert.alert('Error', 'Failed to remove movie');
    }
  };

  const castVote = async (imdbID: string, vote: 'up' | 'down') => {
    if (!currentUser) return;
    
    try {
      // Make the vote ID include the groupId to make votes group-specific
      const voteId = `${currentUser.uid}_${imdbID}_${groupId}`;
      const voteRef = doc(FIRESTORE_DB, 'movieVotes', voteId);
      const voteSnap = await getDoc(voteRef);
      
      if (voteSnap.exists()) {
        const currentVote = voteSnap.data()?.vote;
        if (currentVote === vote) {
          await updateDoc(voteRef, { vote: null });
        } else {
          await updateDoc(voteRef, { vote });
        }
      } else {
        await setDoc(voteRef, {
          userId: currentUser.uid,
          movieId: imdbID,
          groupId: groupId, // Store the groupId in the vote document
          vote,
          seen: false, // Initialize seen status
          timestamp: new Date()
        });
      }
    } catch (err) {
      console.error('Failed to cast vote', err);
      Alert.alert('Error', 'Failed to save your vote');
    }
  };

  const toggleSeen = async (imdbID: string) => {
    if (!currentUser) return;
    
    try {
      const voteId = `${currentUser.uid}_${imdbID}_${groupId}`;
      const voteRef = doc(FIRESTORE_DB, 'movieVotes', voteId);
      const voteSnap = await getDoc(voteRef);
      
      if (voteSnap.exists()) {
        const currentSeen = voteSnap.data()?.seen || false;
        await updateDoc(voteRef, { seen: !currentSeen });
      } else {
        await setDoc(voteRef, {
          userId: currentUser.uid,
          movieId: imdbID,
          groupId: groupId,
          vote: null,
          seen: true, // Initial value is true when toggling from nonexistent
          timestamp: new Date()
        });
      }
    } catch (err) {
      console.error('Failed to toggle seen status', err);
      Alert.alert('Error', 'Failed to update seen status');
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
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{item.title}</Text>
                {currentUser?.uid === item.addedBy && (
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={() => removeMovie(item.imdbID)}
                  >
                    <Text style={styles.removeIcon}>−</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.genre}>{item.genre}</Text>
              <Text style={styles.user}>Added by {item.username}</Text>
              <View style={styles.votesContainer}>
                <View style={styles.leftVoteButtons}>
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
                <TouchableOpacity
                  style={styles.seenButton}
                  onPress={() => toggleSeen(item.imdbID)}
                >
                  <Image
                    source={item.seen ? seenIcon : notSeenIcon}
                    style={styles.voteIcon}
                  />
                  <Text style={[
                    styles.voteCount,
                    item.seen && styles.activeVoteCount
                  ]}>{item.seen ? 'Seen' : 'Not Seen'}</Text>
                </TouchableOpacity>
              </View>
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
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: '#F7EEDB',
    fontWeight: '600',
    flex: 1,
  },
  removeButton: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    color: '#FF6B6B',
    fontSize: 30,
    fontWeight: 'bold',
  },
  genre: {
    fontSize: 14,
    color: '#F7EEDB',
    marginTop: 4,
  },
  user: {
    fontSize: 14,
    color: '#F7EEDB',
    marginTop: 2,
  },
  votesContainer: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'space-between', // This spreads items to opposite ends
  },
  leftVoteButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  seenButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#FFD700',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#aaa',
  },
});