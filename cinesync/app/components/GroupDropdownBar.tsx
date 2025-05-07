import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Group {
  id: string;
  name: string;
}

interface GroupDropdownBarProps {
  groups: Group[];
  currentGroup: Group;
  onGroupSelect: (groupId: string) => void;
}

const GroupDropdownBar: React.FC<GroupDropdownBarProps> = ({ groups, currentGroup, onGroupSelect }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleInvite = (groupId: string) => {
    router.push(`/InviteUser?groupId=${groupId}`);
    setDropdownOpen(false);
  };

  const handleEditGroup = (groupId: string) => {
    router.push(`/addgroup`);
    setDropdownOpen(false);
  };

//   const goToPendingInvites = () => {
//     router.push('/PendingInvites');
//     setDropdownOpen(false);
//   };

  const goToGroupProfile = () => {
    router.push('/addgroup');
  };

  return (
    <View style={{ zIndex: 10 }}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => handleInvite(currentGroup.id)} style={styles.iconLeft}>
          <MaterialCommunityIcons name="account" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleDropdown}>
          <Text style={styles.groupName}>{currentGroup?.name ?? ''}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToGroupProfile} style={styles.iconRight}>
          <Ionicons name="settings-sharp" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Dropdown */}
      {dropdownOpen && (
        <View style={styles.dropdown}>
          <ScrollView style={{ maxHeight: 300 }}>
            {groups.filter(Boolean).map((group) => (
              <View key={group.id} style={styles.groupRow}>
                <TouchableOpacity onPress={() => handleInvite(group.id)}>
                  <MaterialCommunityIcons name="account" size={22} color="#000" style={{ marginRight: 8 }} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { onGroupSelect(group.id); toggleDropdown(); }} style={{ flex: 1 }}>
                  <Text style={styles.groupText}>{group?.name ?? ''}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleEditGroup(group.id)}>
                  <Ionicons name="settings-sharp" size={20} color="#000" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Pending Invites Button */}
          {/* <TouchableOpacity style={styles.pendingButton} onPress={goToPendingInvites}>
            <Text style={styles.pendingButtonText}>Pending Invites</Text>
          </TouchableOpacity> */}
        </View>
      )}
    </View>
  );
};

export default GroupDropdownBar;

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6C343',
    padding: 12,
    borderRadius: 12,
    margin: 10,
    justifyContent: 'space-between',
  },
  iconLeft: {
    paddingRight: 8,
  },
  iconRight: {
    paddingLeft: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  dropdown: {
    backgroundColor: '#F6C343',
    marginHorizontal: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  groupText: {
    fontSize: 16,
    color: '#000',
  },
  pendingButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    alignItems: 'center',
  },
  pendingButtonText: {
    color: '#F6C343',
    fontWeight: 'bold',
  },
});