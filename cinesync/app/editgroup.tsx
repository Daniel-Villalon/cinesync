import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import styles from '../styles/AddGroup.styles';

const EditGroupScreen = () => {
  const { groupId } = useLocalSearchParams();
  const [groupName, setGroupName] = useState('New Group');
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('Rotten Tomatoes Rating');
  const [fairnessFilter, setFairnessFilter] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<null | 'sort' | 'fairness'>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setGroupImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace('/login');
      } else {
        setAuthChecked(true);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const groupRef = doc(FIRESTORE_DB, 'groups', groupId as string);
        const groupSnap = await getDoc(groupRef);
        const data = groupSnap.data();
        if (data) {
          setGroupName(data.name || 'Group');
          setGroupImage(data.profilePicture || null);
          setSortBy(data.sortBy || 'Rotten Tomatoes Rating');
          setFairnessFilter(data.fairnessFilter ?? true);
        }
      } catch (err) {
        console.error('Error loading group info:', err);
      }
    };

    if (authChecked && groupId) fetchGroupInfo();
  }, [authChecked, groupId]);

  const updateGroup = async (
    name: string,
    userId: string,
    profilePicture: string | null,
    fairness: boolean,
    sort: string
  ) => {
    try {
      const groupRef = doc(FIRESTORE_DB, 'groups', groupId as string);
      await updateDoc(groupRef, {
        name: name,
        profilePicture: profilePicture,
        fairnessFilter: fairness,
        sortBy: sort,
        lastUpdatedBy: userId,
        updatedAt: new Date(),
      });
    } catch (error) {
      throw new Error('Failed to update group: ' + error);
    }
  };

  const handleUpdateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Group name required');
      return;
    }
    try {
      await updateGroup(groupName.trim(), user!.uid, groupImage, fairnessFilter, sortBy);
      router.push({ pathname: '/homescreen', params: { groupId: groupId } })    } catch (error) {
      console.error(error);
      Alert.alert('Failed to update group');
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
        {/* Group Image */}
        <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
          {groupImage ? (
            <Image source={{ uri: groupImage }} style={styles.groupImage} />
          ) : (
            <View style={styles.defaultImage}>
              <MaterialCommunityIcons name="account" size={64} color="#C9A84F" />
            </View>
          )}
          <View style={styles.editIcon}>
            <MaterialCommunityIcons name="pencil" size={32} color="#000" />
          </View>
        </TouchableOpacity>

        {/* Group Name */}
        <TextInput
          style={styles.groupNameInput}
          value={groupName}
          onChangeText={setGroupName}
        />

        {/* Sort By */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sort by:</Text>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => setDropdownOpen(dropdownOpen === 'sort' ? null : 'sort')}
              style={styles.dropdown}
            >
              <Text style={styles.dropdownText}>{sortBy}</Text>
              <Ionicons
                name={dropdownOpen === 'sort' ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#FFD700"
              />
            </TouchableOpacity>
            {dropdownOpen === 'sort' && (
              <View style={styles.dropdownMenu}>
                {['Rotten Tomatoes Rating', 'Liked', 'Not seen']
                  .filter(option => option !== sortBy)
                  .map(option => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        setSortBy(option);
                        setDropdownOpen(null);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text style={styles.dropdownItemText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </View>
        </View>

        {/* Fairness Filter */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Fairness filter:</Text>
          <View style={styles.filterControlGroup}>
            <TouchableOpacity
              onPress={() => setDropdownOpen(dropdownOpen === 'fairness' ? null : 'fairness')}
              style={[styles.dropdown, { width: 50 }]}
            >
              <Text style={styles.dropdownText}>{fairnessFilter ? 'On' : 'Off'}</Text>
            </TouchableOpacity>
            
            {/* Info Icon - Now in a container that keeps it next to the dropdown */}
            <TouchableOpacity 
              onPress={() => setShowInfoModal(true)}
              style={styles.infoIconContainer}
            >
              <MaterialCommunityIcons name="information-outline" size={20} color="#F5CB5C" />
            </TouchableOpacity>
            
            {dropdownOpen === 'fairness' && (
              <View style={[styles.dropdownMenu, { width: 50, position: 'absolute', top: '100%', left: 0, zIndex: 10 }]}>
                {['On', 'Off']
                  .filter(option => option !== (fairnessFilter ? 'On' : 'Off'))
                  .map(option => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        setFairnessFilter(option === 'On');
                        setDropdownOpen(null);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text style={styles.dropdownItemText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Update Group Button */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleUpdateGroup}>
        <Text style={styles.deleteText}>Update Group</Text>
      </TouchableOpacity>
      <Modal visible={showInfoModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalContent}>
            <Text style={styles.infoModalTitle}>Fairness Filter</Text>
            <Text style={styles.infoModalText}>
              Hello! The fairness filter ensures that movie selections are distributed evenly among group members' preferences.
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowInfoModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    
  );
};

export default EditGroupScreen;
