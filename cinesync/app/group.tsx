import React, { useEffect, useState,useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, Alert, ActivityIndicator} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { collection, getDocs, doc, getDoc,query, where } from 'firebase/firestore';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import styles from '../styles/Group.styles';
import { useFocusEffect } from '@react-navigation/native';

export default function GroupsScreen() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<number>(0);

  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  const toggleEdit = () => setIsEditing(!isEditing);

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
      }
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  // 🚀 Optimized fetchUserGroups with faster loading
  const fetchUserGroups = async () => {
    if (!user) return;
    try {
      const userRef = doc(FIRESTORE_DB, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userGroupsIds = userSnap.data()?.groups || [];

      if (userGroupsIds.length === 0) {
        setGroups([]);
        setLoading(false);
        return;
      }

      // Start loading groups in parallel immediately
      const groupPromises = userGroupsIds.map(async (groupId: string) => {
        try {
          const groupDoc = await getDoc(doc(FIRESTORE_DB, 'groups', groupId));
          if (groupDoc.exists()) {
            return { id: groupDoc.id, ...groupDoc.data() };
          }
          return null;
        } catch (err) {
          console.warn(`Failed to fetch group ${groupId}:`, err);
          return null;
        }
      });

      // Load groups and update UI as soon as we start getting data
      setLoading(false); // Set loading to false immediately after starting the requests
      
      const groupResults = await Promise.allSettled(groupPromises);
      
      const userGroups = groupResults
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => (result as any).value);

      setGroups(userGroups);
    } catch (err) {
      console.error('Error loading user groups:', err);
      Alert.alert('Failed to load groups');
      setLoading(false);
    }
  };

  //fetching Pending Invites
  const fetchPendingInvites = async () => {
    if (!user) return;
  
    try {
      const q = query(
        collection(FIRESTORE_DB, 'invites'),
        where('email', '==', user.email),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      const inviteCount = snapshot.size;
      setPendingInvites(inviteCount);
    } catch (err) {
      console.error('Error fetching invites:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (authChecked) {
        setLoading(true); // Set loading when starting to fetch
        fetchUserGroups();
        fetchPendingInvites();
      }
    }, [authChecked])
  );

  if (!authChecked) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerSide} onPress={() => router.replace('/login')}>
          {/* <MaterialCommunityIcons name="chevron-left" size={24} color="#F6C343" /> */}
          <Text style={{ fontSize: 16, color:"#F6C343" }}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {"Who's watching?"}
          </Text>
        </View>
      </View>

      {/* Groups Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F6C343" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.groupContainer}>
          <View style={styles.groupGrid}>
            {groups.map((group, index) => (
              <TouchableOpacity
                key={index}
                style={styles.groupWrapper}
                onPress={() => !isEditing && router.push({ pathname: '/homescreen', params: { groupId: group.id } })}
              >
                <View style={[styles.avatarCircleLarge, { backgroundColor: group.color || '#F6C343', overflow: 'hidden' }]}>
                  {group.profilePicture ? (
                    <Image source={{ uri: group.profilePicture }} style={{ width: '100%', height: '100%' }} resizeMode="cover"  />
                  ) : (
                  <MaterialCommunityIcons name="account" size={64} color="#000" />

                  )} 
                  {isEditing && (
                    <TouchableOpacity
                      style={styles.editIcon}
                      onPress={() => router.push(`/InviteUser?groupId=${group.id}`)}
                    >
                      <MaterialCommunityIcons name="pencil" size={18} color="#000" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.groupLabel}>{group.name}</Text>
              </TouchableOpacity>
            ))}

            {/* Add Group Button */}
            {!isEditing && (
              <TouchableOpacity style={styles.groupWrapper} onPress={() => router.push('/addgroup')}>
                <View style={styles.avatarCircleLarge}>
                  <MaterialCommunityIcons name="plus" size={48} color="#ccc" />
                </View>
                <Text style={styles.addGroupText}>Add Group</Text>
              </TouchableOpacity>
            )}

            {/* Make grid even */}
            {(groups.length + (!isEditing ? 1 : 0)) % 2 !== 0 && (
              <View style={[styles.groupWrapper, { opacity: 0 }]} />
            )}
          </View>
        </ScrollView>
      )}
      
      {/* Invite Notification Function */}
      {!isEditing && (
        <TouchableOpacity style={styles.mail} onPress={() => router.push('/PendingInvites')}>
        {pendingInvites > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>
              {pendingInvites > 9 ? '9+' : pendingInvites}
            </Text>
          </View>
        )}
        <MaterialCommunityIcons name="email-outline" size={28} color="#000" />
      </TouchableOpacity>      
      )}
    </SafeAreaView>
  );
}
