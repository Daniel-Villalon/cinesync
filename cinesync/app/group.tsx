import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import styles from '../styles/Group.styles';

export default function GroupsScreen() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

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

  // 🚀 Optimized fetchUserGroups
  const fetchUserGroups = async () => {
    if (!user) return;
    try {
      const userRef = doc(FIRESTORE_DB, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userGroupsIds = userSnap.data()?.groups || [];

      if (userGroupsIds.length === 0) {
        setGroups([]);
        return;
      }

      const groupPromises = userGroupsIds.map((groupId: string) =>
        getDoc(doc(FIRESTORE_DB, 'groups', groupId))
      );

      const groupDocs = await Promise.all(groupPromises);

      const userGroups = groupDocs
        .filter(docSnap => docSnap.exists())
        .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

      setGroups(userGroups);
    } catch (err) {
      console.error('Error loading user groups:', err);
      Alert.alert('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked) {
      fetchUserGroups();
    }
  }, [authChecked]);

  if (!authChecked) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerSide} onPress={() => router.replace('/login')}>
          <Ionicons name="chevron-back" size={24} color="#F6C343" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Groups' : "Who's watching"}
          </Text>
        </View>

        <TouchableOpacity onPress={toggleEdit} style={styles.headerSide}>
          <Text style={styles.selectText}>{isEditing ? 'Done' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      {/* Groups Grid */}
      <ScrollView contentContainerStyle={styles.groupContainer}>
        <View style={styles.groupGrid}>
          {loading ? (
            <Text style={{ color: '#aaa' }}>Loading...</Text>
          ) : groups.length === 0 ? (
            <Text style={{ color: '#aaa' }}>No groups yet.</Text>
          ) : (
            groups.map((group, index) => (
              <TouchableOpacity
                key={index}
                style={styles.groupWrapper}
                onPress={() => !isEditing && router.push({ pathname: '/homescreen', params: { groupId: group.id } })}
              >
                <View style={[styles.avatarCircleLarge, { backgroundColor: group.color || '#F6C343' }]}>
                  <MaterialCommunityIcons name="account" size={64} color="#000" />
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
            ))
          )}

          {/* Add Group Button */}
          {!isEditing && (
            <TouchableOpacity style={styles.groupWrapper} onPress={() => router.push('/addgroup')}>
              <View style={styles.avatarCircleLarge}>
                <Ionicons name="add" size={48} color="#ccc" />
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
    </SafeAreaView>
  );
}
