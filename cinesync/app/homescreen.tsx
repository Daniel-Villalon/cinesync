<<<<<<< Updated upstream
import React from 'react';
import { Link } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');


export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Floating circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />
      <View style={[styles.circle, styles.circle4]} />
      <View style={[styles.circle, styles.circle5]} />

      {/* App title */}
      <Text style={styles.title}>CineSync</Text>
      <Text style={styles.tagline}>Where friends and movies come together.</Text>
=======
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { collection, getDocs } from 'firebase/firestore';
import MovieSearch from './MovieSearch';
import GroupDropdownBar from '../components/GroupDropdownBar';

export default function Homescreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const [authChecked, setAuthChecked] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(groupId as string);
  const user = FIREBASE_AUTH.currentUser;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (!user) {
        router.replace('/login');
      }
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return;
      try {
        const userRef = doc(FIRESTORE_DB, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const groupIds = userSnap.data()?.groups || [];

        if (groupIds.length > 0) {
          const groupDocs = await Promise.all(
            groupIds.map((id: string) => getDoc(doc(FIRESTORE_DB, 'groups', id)))
          );

          const fetchedGroups = groupDocs
            .filter(doc => doc.exists())
            .map(doc => ({
              id: doc.id,
              name: doc.data()?.name || 'Unnamed Group',
            }));

          setGroups(fetchedGroups);

          if (!currentGroupId && fetchedGroups.length > 0) {
            setCurrentGroupId(fetchedGroups[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, [user]);
>>>>>>> Stashed changes

      {/* Buttons */}
      <Link href="/SignIn" asChild>
        <TouchableOpacity style={styles.signInButton}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </Link>

<<<<<<< Updated upstream
      <Link href="/SignUp" asChild>
        <TouchableOpacity style={styles.signUpButton}>
          <Text style={[styles.buttonText, { color: '#2B2C5A' }]}>Sign Up</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/MovieSearch" asChild>
        <TouchableOpacity style={styles.someButton}>
          <Text style={styles.buttonText}>Test Movie Search</Text>
        </TouchableOpacity>
      </Link>

    </View>
=======
  if (!authChecked || (groups.length > 0 && !currentGroupId)) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#F7EEDB" />
      </SafeAreaView>
    );
  }

  const currentGroup = groups.find((g) => g.id === currentGroupId);

  if (!currentGroup) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Group not found.</Text>
      </SafeAreaView>
    );
  }

  if (!currentGroupId) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>No current group selected.</Text>
      </SafeAreaView>
    );
  }
  
  
  return (
    <SafeAreaView style={styles.container}> {/* ✅ use SafeAreaView */}
      {/* Group Dropdown at the top */}
      <GroupDropdownBar
        groups={groups}
        currentGroup={currentGroup}
        onGroupSelect={(newGroupId) => {
          setCurrentGroupId(newGroupId);
          router.push({ pathname: '/homescreen', params: { groupId: newGroupId } });
        }}
      />

      {/* Movie Search under it */}
      <MovieSearch groupId={currentGroupId} />

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* Go back to Group screen */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => router.push('/group')}>
        <Text style={styles.logoutText}>Go to Groups</Text>
      </TouchableOpacity>
    </SafeAreaView>
>>>>>>> Stashed changes
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2B2C5A', // deep navy blue
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#F7EEDB',
    marginTop: -40,
    fontFamily: 'Georgia',
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 40,
    marginTop: 8,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: '#DD775C',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 20,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  signUpButton: {
    backgroundColor: '#F7D491',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  someButton: {
    backgroundColor: '#F7D491',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#2B2C5A',
    fontWeight: '600',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.9,
  },
  circle1: {
    backgroundColor: '#F7D491',
    width: 150,
    height: 150,
    top: -30,
    right: -60,
  },
  circle2: {
    backgroundColor: '#8BBCA6',
    width: 100,
    height: 100,
    top: 60,
    left: -40,
  },
  circle3: {
    backgroundColor: '#DD775C',
    width: 80,
    height: 80,
    top: 120,
    left: 60,
  },
  circle4: {
    backgroundColor: '#DD775C',
    width: 280,
    height: 280,
    bottom: -80,
    left: -100,
  },
  circle5: {
    backgroundColor: '#8BBCA6',
    width: 100,
    height: 100,
    bottom: 40,
    right: -20,
  },
});
