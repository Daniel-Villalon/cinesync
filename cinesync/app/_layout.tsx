import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH } from '@/FirebaseConfig';

export default function Layout() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      setUser(currentUser);
      setReady(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!ready) return;

    const currentPage = segments[0] || '';

    if (!user && currentPage === 'homescreen') {
      router.replace('/login');
    }

    // Redirect authenticated user to homescreen if on login
    if (user && currentPage === 'login') {
      // router.replace('/homescreen');
      router.replace('/groups');

    }
  }, [ready, user, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
