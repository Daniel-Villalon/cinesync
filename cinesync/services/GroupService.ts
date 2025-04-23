import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import { MovieSummary } from './omdbApi';

export const addMovieToGroup = async (
  groupId: string,
  movie: MovieSummary,
  addedBy: string
) => {
  const movieData = {
    ...movie,
    groupId,
    addedBy,
    addedAt: serverTimestamp(),
  };

  await addDoc(collection(FIRESTORE_DB, 'movies'), movieData);
};
