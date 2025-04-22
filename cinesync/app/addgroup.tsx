import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import styles from '../styles/AddGroup.styles';

const AddGroupScreen = () => {
  const [groupName, setGroupName] = useState('New Group');
  const [sortBy, setSortBy] = useState('Rotten Tomatoes Rating');
  const [fairnessFilter, setFairnessFilter] = useState(true);

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account" size={100} color="#C6A941" />
          <TouchableOpacity style={styles.editIcon}>
            <MaterialCommunityIcons name="pencil" size={18} color="#000" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.groupName}
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      {/* Sort by */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Sort by:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={sortBy}
            onValueChange={(itemValue) => setSortBy(itemValue)}
            style={styles.picker}
            dropdownIconColor="#FFD366"
          >
            <Picker.Item label="Rotten Tomatoes Rating" value="Rotten Tomatoes Rating" />
            <Picker.Item label="Liked" value="Liked" />
            <Picker.Item label="Not seen" value="Not seen" />
          </Picker>
        </View>
      </View>

      {/* Fairness Filter */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Fairness filter:</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              fairnessFilter && styles.toggleButtonActive,
            ]}
            onPress={() => setFairnessFilter(true)}
          >
            <Text
              style={[
                styles.toggleText,
                fairnessFilter && styles.toggleTextActive,
              ]}
            >
              On
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              !fairnessFilter && styles.toggleButtonActive,
            ]}
            onPress={() => setFairnessFilter(false)}
          >
            <Text
              style={[
                styles.toggleText,
                !fairnessFilter && styles.toggleTextActive,
              ]}
            >
              Off
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={22} color="#FFD366" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AddGroupScreen;
