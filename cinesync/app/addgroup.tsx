// screens/AddGroupScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Menu, Provider } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import styles from '../styles/AddGroup.styles';

const AddGroupScreen = () => {
  const [groupName, setGroupName] = useState('New Group');
  const [groupImage, setGroupImage] = useState(null);
  const [sortBy, setSortBy] = useState('Rotten Tomatoes Rating');
  const [fairnessFilter, setFairnessFilter] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

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

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <Provider>
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
          <View style={styles.settingInputWrapper}>
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={
                <TouchableOpacity onPress={openMenu} style={styles.dropdown}>
                  <Text style={styles.dropdownText}>{sortBy}</Text>
                  <Ionicons name="chevron-down" size={16} color="#FFD700" />
                </TouchableOpacity>
              }
              contentStyle={styles.menuContent}
            >
              <Menu.Item
                onPress={() => {
                  setSortBy('Rotten Tomatoes Rating');
                  closeMenu();
                }}
                title="Rotten Tomatoes Rating"
                titleStyle={styles.menuItem}
              />
              <Menu.Item
                onPress={() => {
                  setSortBy('Liked');
                  closeMenu();
                }}
                title="Liked"
                titleStyle={styles.menuItem}
              />
              <Menu.Item
                onPress={() => {
                  setSortBy('Not seen');
                  closeMenu();
                }}
                title="Not seen"
                titleStyle={styles.menuItem}
              />
            </Menu>
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
    </Provider>
  );
};

export default AddGroupScreen;
