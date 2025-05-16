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

// Icons
const thumbsUpIcon = require('@/assets/images/icons/like.png');
const thumbsDownIcon = require('@/assets/images/icons/dislike.png');
const thumbsUpSelectedIcon = require('@/assets/images/icons/likeSelected.png');
const thumbsDownSelectedIcon = require('@/assets/images/icons/dislikeSelected.png');
const seenIcon = require('@/assets/images/icons/seen.png');
const notSeenIcon = require('@/assets/images/icons/notSeen.png');

type MovieEntry = {
  imdbID: string;
  addedBy: string;
  addedAt: any;
  seen?: boolean; // Add seen status to the movie entry itself
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
  seen: boolean;
  userRating: number;
};

type Props = {
  groupId: string;
  initialType?: 'watchlist' | 'watched';
};

const MovieList: React.FC<Props> = ({ groupId, initialType = 'watchlist' }) => {
  const [movies, setMovies] = useState<MovieWithDetails[]>([]);
  const [allMovies, setAllMovies] = useState<MovieWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'watchlist' | 'watched'>(initialType);
  const router = useRouter();
  const currentUser = getAuth().currentUser;

  const fetchUserPreferences = async (movieEntries: MovieEntry[]) => {
    if (!currentUser) return movieEntries;
    try {
      const movieIds = movieEntries.map(entry => entry.imdbID);
      const votesMap: Record<string, 'up' | 'down' | null> = {};
      const ratingsMap: Record<string, number> = {};
      
      await Promise.all(movieIds.map(async (movieId) => {
        const voteRef = doc(FIRESTORE_DB, 'movieVotes', `${currentUser.uid}_${movieId}_${groupId}`);
        const voteSnap = await getDoc(voteRef);
        if (voteSnap.exists()) {
          votesMap[movieId] = voteSnap.data()?.vote || null;
        }
        
        const ratingRef = doc(FIRESTORE_DB, 'userRatings', `${currentUser.uid}_${movieId}`);
        const ratingSnap = await getDoc(ratingRef);
        
        if (ratingSnap.exists()) {
          ratingsMap[movieId] = ratingSnap.data()?.rating || 0;
        }
      }));
      
      return movieEntries.map(entry => ({
        ...entry,
        userVote: votesMap[entry.imdbID] || null,
        seen: entry.seen || false, // Use the movie entry's seen status
        userRating: ratingsMap[entry.imdbID] || 0
      }));
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      return movieEntries;
    }
  };

  const fetchMovieDetails = async (movieEntries: MovieEntry[]) => {
    const entriesWithPreferences = await fetchUserPreferences(movieEntries);
    
    const detailedMovies = await Promise.all(
      entriesWithPreferences.map(async (entry) => {
        try {
          const details = await getMovieDetails(entry.imdbID);
          const userRef = doc(FIRESTORE_DB, 'users', entry.addedBy);
          const userSnap = await getDoc(userRef);
          const username = userSnap.exists() ? userSnap.data()?.username || 'Unknown' : 'Unknown';
          
          const thumbsUpRef = collection(FIRESTORE_DB, 'movieVotes');
          const thumbsUpQuery = query(
            thumbsUpRef,
            where('movieId', '==', entry.imdbID),
            where('groupId', '==', groupId),
            where('vote', '==', 'up')
          );
          const thumbsUpSnap = await getDocs(thumbsUpQuery);
          
          const thumbsDownRef = collection(FIRESTORE_DB, 'movieVotes');
          const thumbsDownQuery = query(
            thumbsDownRef,
            where('movieId', '==', entry.imdbID),
            where('groupId', '==', groupId),
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
            seen: entry.seen || false, // Use the movie entry's seen status
            userRating: (entry as any).userRating || 0,
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
            seen: entry.seen || false, // Use the movie entry's seen status
            userRating: (entry as any).userRating || 0,
          };
        }
      })
    );
    
    const sortedMovies = detailedMovies.sort((a, b) => {
      const netLikesA = a.thumbsUp - a.thumbsDown;
      const netLikesB = b.thumbsUp - b.thumbsDown;
    
      // Sort descending by net likes
      return netLikesB - netLikesA;
    });    
    
    setAllMovies(sortedMovies);
    filterMoviesByActiveTab(sortedMovies);
  };
  
  const filterMoviesByActiveTab = (moviesList = allMovies) => {
    let filtered = moviesList.filter(movie => {
      return activeTab === 'watchlist' ? !movie.seen : movie.seen;
    });

    if (activeTab === 'watchlist') {
      // sort by net likes (likes - dislikes)
      filtered = filtered.sort((a, b) => {
        const aScore = (a.thumbsUp || 0) - (a.thumbsDown || 0);
        const bScore = (b.thumbsUp || 0) - (b.thumbsDown || 0);
        return bScore - aScore;
      });
    }

    setMovies(filtered);
  };

  useEffect(() => {
    filterMoviesByActiveTab();
  }, [activeTab, allMovies]); 

  useEffect(() => {
    if (!groupId) return;
    
    let movieListUnsubscribe: () => void;
    let userPreferencesUnsubscribe: () => void;
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
            setAllMovies([]);
          }
          setLoading(false);
        });
        
        if (currentUser) {
          const votesCollectionRef = collection(FIRESTORE_DB, 'movieVotes');
          const votesQuery = query(
            votesCollectionRef,
            where('userId', '==', currentUser.uid),
            where('groupId', '==', groupId)
          );
          const ratingsCollectionRef = collection(FIRESTORE_DB, 'userRatings');
          const ratingsQuery = query(
            ratingsCollectionRef, 
            where('userId', '==', currentUser.uid)
          );
          userPreferencesUnsubscribe = onSnapshot(votesQuery, () => {
            if (currentMovieEntries.length > 0) {
              fetchMovieDetails(currentMovieEntries);
            }
          });
          
          onSnapshot(ratingsQuery, () => {
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
      if (userPreferencesUnsubscribe) userPreferencesUnsubscribe();
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
      // Find the movie in our state
      const movieIndex = allMovies.findIndex(m => m.imdbID === imdbID);
      if (movieIndex === -1) return;
      
      const movie = allMovies[movieIndex];
      
      // Calculate the new vote state
      let newVote: 'up' | 'down' | null = vote;
      let thumbsUpDelta = 0;
      let thumbsDownDelta = 0;
      
      if (movie.userVote === vote) {
        // User is toggling the vote off
        newVote = null;
        if (vote === 'up') thumbsUpDelta = -1;
        if (vote === 'down') thumbsDownDelta = -1;
      } else {
        // User is changing vote or voting for the first time
        if (movie.userVote === 'up') {
          thumbsUpDelta = -1; // Remove previous upvote
        } else if (movie.userVote === 'down') {
          thumbsDownDelta = -1; // Remove previous downvote
        }
        
        if (vote === 'up') thumbsUpDelta += 1;
        if (vote === 'down') thumbsDownDelta += 1;
      }
      
      // Update the state immediately (optimistic update)
      const updatedMovie = {
        ...movie,
        userVote: newVote,
        thumbsUp: movie.thumbsUp + (vote === 'up' ? (newVote === null ? -1 : 1) : 0),
        thumbsDown: movie.thumbsDown + (vote === 'down' ? (newVote === null ? -1 : 1) : 0)
      };
      
      // If the user changed from one vote to the other, adjust both counts
      if (movie.userVote === 'up' && vote === 'down') {
        updatedMovie.thumbsUp -= 1;
      } else if (movie.userVote === 'down' && vote === 'up') {
        updatedMovie.thumbsDown -= 1;
      }
      
      // Update our local state immediately
      const newAllMovies = [...allMovies];
      newAllMovies[movieIndex] = updatedMovie;
      setAllMovies(newAllMovies);
      
      // Update the filtered movies list too
      const filteredMovieIndex = movies.findIndex(m => m.imdbID === imdbID);
      if (filteredMovieIndex !== -1) {
        const newMovies = [...movies];
        newMovies[filteredMovieIndex] = updatedMovie;
        setMovies(newMovies);
      }
      
      // Now perform the actual database update in the background
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
          groupId: groupId,
          vote,
          timestamp: new Date()
          // Removed the seen field since we're now storing it on the movie itself
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
      // Find the movie in our state
      const movieIndex = allMovies.findIndex(m => m.imdbID === imdbID);
      if (movieIndex === -1) return;
      
      const movie = allMovies[movieIndex];
      const newSeen = !movie.seen;
      
      // Update our local state immediately (optimistic update)
      const updatedMovie = {
        ...movie,
        seen: newSeen
      };
      
      const newAllMovies = [...allMovies];
      newAllMovies[movieIndex] = updatedMovie;
      setAllMovies(newAllMovies);
      
      // Filter movies according to active tab
      const filteredMovies = newAllMovies.filter(movie => {
        if (activeTab === 'watchlist') {
          return !movie.seen;
        } else {
          return movie.seen;
        }
      });
      setMovies(filteredMovies);
      
      // Now perform the actual database update in the background
      // Get the group's movie list reference
      const groupRef = doc(FIRESTORE_DB, 'groups', groupId);
      const groupSnap = await getDoc(groupRef);
      
      if (!groupSnap.exists()) return;
      
      const listId = groupSnap.data()?.groupList;
      if (!listId) return;
      
      const movieListRef = doc(FIRESTORE_DB, 'movieLists', listId);
      const movieListSnap = await getDoc(movieListRef);
      
      if (!movieListSnap.exists()) return;
      
      const movieList = movieListSnap.data();
      const movies = movieList.movies || [];
      
      // Find and update the specific movie's seen status
      const updatedMovies = movies.map((m: MovieEntry) => {
        if (m.imdbID === imdbID) {
          return {
            ...m,
            seen: newSeen,
            // If marking as seen, record who marked it and when
            markedSeenBy: newSeen ? currentUser.uid : null,
            markedSeenAt: newSeen ? new Date() : null
          };
        }
        return m;
      });
      
      // Update the movie list document
      await updateDoc(movieListRef, { movies: updatedMovies });
      
      // Optional: Record this action in activity log
      if (newSeen) {
        const activityRef = collection(FIRESTORE_DB, 'groupActivities');
        await setDoc(doc(activityRef), {
          groupId,
          userId: currentUser.uid,
          movieId: imdbID,
          action: 'marked_as_watched',
          timestamp: new Date()
        });
      }
    } catch (err) {
      console.error('Failed to toggle seen status', err);
      Alert.alert('Error', 'Failed to update seen status');
    }
  };

  const updateRating = async (imdbID: string, rating: number) => {
    if (!currentUser) return;
    
    try {
      // Find the movie in our state
      const movieIndex = allMovies.findIndex(m => m.imdbID === imdbID);
      if (movieIndex === -1) return;
      
      const movie = allMovies[movieIndex];
      
      // Update our local state immediately (optimistic update)
      const updatedMovie = {
        ...movie,
        userRating: rating
      };
      
      const newAllMovies = [...allMovies];
      newAllMovies[movieIndex] = updatedMovie;
      setAllMovies(newAllMovies);
      
      // Update the filtered movies list too
      const filteredMovieIndex = movies.findIndex(m => m.imdbID === imdbID);
      if (filteredMovieIndex !== -1) {
        const newMovies = [...movies];
        newMovies[filteredMovieIndex] = updatedMovie;
        setMovies(newMovies);
      }
      
      // Now perform the actual database updates in the background
      const ratingId = `${currentUser.uid}_${imdbID}`;
      const ratingRef = doc(FIRESTORE_DB, 'userRatings', ratingId);
      
      await setDoc(ratingRef, {
        userId: currentUser.uid,
        movieId: imdbID,
        rating,
        timestamp: new Date()
      });
      
      // If the movie is not already marked as seen, mark it as seen for everyone
      if (!movie.seen) {
        await toggleSeen(imdbID);
      }
    } catch (err) {
      console.error('Failed to update rating', err);
      Alert.alert('Error', 'Failed to save rating');
    }
  };

  const renderStars = (rating: number) => {
    const fullStar = '★';
    const emptyStar = '☆';
    const rounded = Math.round(rating);
    return fullStar.repeat(rounded) + emptyStar.repeat(5 - rounded);
  };

  const renderRatingSelector = (imdbID: string, currentRating: number) => {
    return (
      <View style={styles.ratingSelector}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            onPress={() => updateRating(imdbID, star)}
            style={styles.starButton}
          >
            <Text style={[
              styles.starText,
              star <= currentRating && styles.selectedStar
            ]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTabSelector = () => {
    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'watchlist' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('watchlist')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'watchlist' && styles.activeTabText
          ]}>Watchlist</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'watched' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('watched')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'watched' && styles.activeTabText
          ]}>Watched</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} color="#F7EEDB" />;
  }

  return (
    <View style={styles.container}>
      {renderTabSelector()}
      
      {movies.length === 0 ? (
        <Text style={styles.emptyText}>
          {activeTab === 'watchlist' ? 'No movies added yet.' : 'No watched movies yet.'}
        </Text>
      ) : (
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
                    <TouchableOpacity 
                      style={styles.removeButton} 
                      onPress={() => removeMovie(item.imdbID)}
                    >
                      <Text style={styles.removeIcon}>−</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.genre}>{item.genre}</Text>
                <Text style={styles.user}>Added by {item.username}</Text>
                
                {activeTab === 'watchlist' ? (
                  // Watchlist view with votes
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
                    </TouchableOpacity>
                  </View>
                ) : (
                  // Watched view with ratings
                  <View style={styles.ratingContainer}>
                    <View style={styles.ratingSelectorContainer}>
                      <Text style={styles.ratingLabel}>Your Rating:</Text>
                      {renderRatingSelector(item.imdbID, item.userRating)}
                    </View>
                    <TouchableOpacity
                      style={styles.seenButton}
                      onPress={() => toggleSeen(item.imdbID)}
                    >
                      <Image
                        source={item.seen ? seenIcon : notSeenIcon}
                        style={styles.voteIcon}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
          style={{ maxHeight: 725 }}
          scrollEventThrottle={16}
        />
      )}
    </View>
  );
};

export default MovieList;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#2C2C2E',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#F7EEDB',
    fontWeight: '600',
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
    justifyContent: 'space-between',
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
  ratingContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingSelectorContainer: {
    flex: 1,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#F7EEDB',
  },
  ratingSelector: {
    flexDirection: 'row',
    marginTop: 4,
  },
  starButton: {
    marginRight: 8,
  },
  starText: {
    fontSize: 24,
    color: '#AAAAAA',
  },
  selectedStar: {
    color: '#FFD700',
  },
  unseenText: {
    color: '#64B5F6',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#aaa',
  },
});