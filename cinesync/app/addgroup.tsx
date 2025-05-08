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
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { createGroup } from '../services/GroupService';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';
import styles from '../styles/AddGroup.styles';

const AddGroupScreen = () => {
  const [groupName, setGroupName] = useState('New Group');
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('Rotten Tomatoes Rating');
  const [fairnessFilter, setFairnessFilter] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<null | 'sort' | 'fairness'>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setGroupImage(result.assets[0].uri);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Group name required');
      return;
    }
    try {
      await createGroup(groupName.trim(), user!.uid, groupImage, fairnessFilter, sortBy);
      router.replace('/group'); // go back to group page
    } catch (error) {
      console.error(error);
      Alert.alert('Failed to create group');
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
              <Ionicons name="person" size={64} color="#C9A84F" />
            </View>
          )}
          <View style={styles.editIcon}>
            <Ionicons name="pencil" size={32} color="#000" />
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
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => setDropdownOpen(dropdownOpen === 'fairness' ? null : 'fairness')}
              style={[styles.dropdown, { width: 50 }]}
            >
              <Text style={styles.dropdownText}>{fairnessFilter ? 'On' : 'Off'}</Text>
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
          <TouchableOpacity onPress={() => setShowInfoModal(true)}>
            <Ionicons name="information-circle" size={20} color="#FFD700" style={{ marginLeft: 5 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Create Group Button */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleCreateGroup}>
        <Text style={styles.deleteText}>Create Group</Text>
      </TouchableOpacity>

      {/* Info Modal */}
      <Modal visible={showInfoModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalContent}>
            <Text style={styles.infoModalTitle}>Fairness Filter</Text>
            <Text style={styles.infoModalText}>
              The user whose movie was most recently watched will have all their movies removed from view in the watchlist until a different user's movie is watched.
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

export default AddGroupScreen;