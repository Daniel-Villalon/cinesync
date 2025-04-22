import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../styles/Group.styles';

const groups = [
  { name: 'Group 1', color: '#F6C343' },
];

export default function EditGroupsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerSide}>
          <Ionicons name="chevron-back" size={24} color="#F6C343" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Edit Groups</Text>
        </View>

        <TouchableOpacity style={styles.headerSide}>
          <Text style={styles.selectText}>Select</Text>
        </TouchableOpacity>
      </View>

      {/* Groups Grid */}
      <ScrollView contentContainerStyle={styles.groupContainer}>
        <View style={styles.groupGrid}>
          {groups.map((group, index) => (
            <View key={index} style={styles.groupWrapper}>
              <View style={[styles.avatarCircleLarge, { backgroundColor: group.color }]}>
                <MaterialCommunityIcons name="account" size={64} color="#000" />
                <TouchableOpacity style={styles.editIcon}>
                  <MaterialCommunityIcons name="pencil" size={18} color="#000" />
                </TouchableOpacity>
              </View>
              <Text style={styles.groupLabel}>{group.name}</Text>
            </View>
          ))}

          {/* Add Group */}
          <TouchableOpacity style={styles.groupWrapper}>
            <View style={styles.avatarCircleLarge}>
              <Ionicons name="add" size={48} color="#ccc" />
            </View>
            <Text style={styles.addGroupText}>Add Group</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Button */}
      <TouchableOpacity style={styles.deleteButton}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
