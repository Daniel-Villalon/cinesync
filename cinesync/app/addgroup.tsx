import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import styles from '../styles/AddGroup.styles';

const sortOptions = ['Rotten Tomatoes Rating', 'Liked', 'Not seen'];

const AddGroupScreen = () => {
  const [groupName, setGroupName] = useState('New Group');
  const [groupImage, setGroupImage] = useState(null);
  const [sortBy, setSortBy] = useState('Rotten Tomatoes Rating');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [fairnessFilter, setFairnessFilter] = useState(true);

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

  return (
    <View style={styles.container}>
      {/* Group Image */}
      <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
        {groupImage ? (
          <Image source={{ uri: groupImage }} style={styles.groupImage} />
        ) : (
          <View style={styles.defaultImage}>
            <Ionicons name="person" size={64} color="#FFD700" />
          </View>
        )}
        <View style={styles.editIcon}>
          <Ionicons name="pencil" size={16} color="#000" />
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
            onPress={() => setDropdownOpen(!dropdownOpen)}
            style={styles.dropdown}
          >
            <Text style={styles.dropdownText}>{sortBy}</Text>
            <Ionicons name={dropdownOpen ? "chevron-up" : "chevron-down"} size={16} color="#FFD700" />
          </TouchableOpacity>
          {dropdownOpen && (
            <View style={styles.dropdownMenu}>
              {sortOptions
                .filter(option => option !== sortBy)
                .map(option => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => {
                      setSortBy(option);
                      setDropdownOpen(false);
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
        <View style={styles.settingInputWrapper}>
          <View style={styles.fairnessToggleWrapper}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                fairnessFilter ? styles.toggleActive : styles.toggleInactive,
              ]}
              onPress={() => setFairnessFilter(true)}
            >
              <Text
                style={[
                  styles.toggleText,
                  fairnessFilter ? styles.toggleTextActive : styles.toggleTextInactive,
                ]}
              >
                On
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !fairnessFilter ? styles.toggleActive : styles.toggleInactive,
              ]}
              onPress={() => setFairnessFilter(false)}
            >
              <Text
                style={[
                  styles.toggleText,
                  !fairnessFilter ? styles.toggleTextActive : styles.toggleTextInactive,
                ]}
              >
                Off
              </Text>
            </TouchableOpacity>
            <Ionicons
              name="information-circle"
              size={20}
              color="#FFD700"
              style={{ marginLeft: 10 }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default AddGroupScreen;
