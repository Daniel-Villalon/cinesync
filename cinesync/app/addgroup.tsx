import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import styles from '../styles/AddGroup.styles';

const AddGroupScreen = () => {
  const [groupName, setGroupName] = useState('New Group');
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('Rotten Tomatoes Rating');
  const [fairnessFilter, setFairnessFilter] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<null | 'sort' | 'fairness'>(null);

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
            <Ionicons name="person" size={64} color="#C9A84F" />
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
            <View style={{ position: 'relative' }}>
            <TouchableOpacity
                onPress={() => setDropdownOpen(dropdownOpen === 'fairness' ? null : 'fairness')}
                style={[styles.dropdown, { width: 50 }]}
            >
                <Text style={styles.dropdownText}>{fairnessFilter ? 'On' : 'Off'}</Text>
            </TouchableOpacity>

            {/* Dropdown menu, positioned below the button */}
            {dropdownOpen === 'fairness' && (
                <View
                style={[
                    styles.dropdownMenu,
                    {
                    width: 50,
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    zIndex: 10,
                    },
                ]}
                >
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
            {/* Info Icon*/}
            <TouchableOpacity onPress={() => Alert.alert('AAAAAAAAAAAAAA')}>
                <Ionicons
                    name="information-circle"
                    size={20}
                    color="#FFD700"
                    style={{ marginLeft: 5 }}
                />
            </TouchableOpacity>
        </View>
        </View>

    </View>
  );
};

export default AddGroupScreen;
