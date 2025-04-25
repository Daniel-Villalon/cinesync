import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from '../styles/Group.styles';

const groups = [
  { name: 'Group 1', color: '#F6C343' },
  { name: 'Group 3', color: '#F6C343' },
  { name: 'Group 4', color: '#F6C343' },
];

export default function GroupsScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerSide}>
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
          {groups.map((group, index) => (
            <View key={index} style={styles.groupWrapper}>
              <View style={[styles.avatarCircleLarge, { backgroundColor: group.color }]}>
                <MaterialCommunityIcons name="account" size={64} color="#000" />
                {isEditing && (
                  <TouchableOpacity style={styles.editIcon}>
                    <MaterialCommunityIcons name="pencil" size={18} color="#000" />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.groupLabel}>{group.name}</Text>
            </View>
          ))}
        {/* Add Group */}
        {!isEditing && (
            <TouchableOpacity style={styles.groupWrapper} onPress={() => router.push('/addgroup')}>
                <View style={styles.avatarCircleLarge}>
                <Ionicons name="add" size={48} color="#ccc" />
                </View>
                <Text style={styles.addGroupText}>Add Group</Text>
            </TouchableOpacity>
        )}
        {/* User formatting */}
        {(groups.length + (!isEditing ? 1 : 0)) % 2 !== 0 && (
            <View style={[styles.groupWrapper, { opacity: 0 }]} />
        )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
