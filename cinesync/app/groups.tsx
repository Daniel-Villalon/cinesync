import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, getDoc, updateDoc, doc } from 'firebase/firestore';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import { styles } from '@/styles/Group.styles';

export default function Groups() {
  const db = FIRESTORE_DB;
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  const [groupList, setGroupList] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    if (!currentUserId) return;
    initializeGroups(currentUserId);
  }, [currentUserId]);

  const initializeGroups = async (uid: string) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    let userGroups: string[] = userSnap.data().groups || [];


    const fetchedGroups = await Promise.all(
      userGroups.map(async (groupId) => {
        const groupSnap = await getDoc(doc(db, 'groups', groupId));
        return groupSnap.exists() ? { id: groupId, ...groupSnap.data() } : null;
      })
    );

    setGroupList(fetchedGroups.filter((group) => group !== null));
  };

  const handleAddGroup = async () => {
    if (!currentUserId || !newGroupName.trim()) return;

    const userRef = doc(db, 'users', currentUserId);
    const userSnap = await getDoc(userRef);
    const userGroups: string[] = userSnap.data()?.groups || [];

    const newGroupRef = await addDoc(collection(db, 'groups'), {
      name: newGroupName.trim(),
      admin: currentUserId,
      userIds: [currentUserId],
      createdAt: new Date(),
    });

    const newGroupId = newGroupRef.id;

    await updateDoc(userRef, {
      groups: [...userGroups, newGroupId],
    });

    setGroupList([...groupList, { id: newGroupId, name: newGroupName.trim() }]);
    setNewGroupName('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Who's watching?</Text>

      <FlatList
        data={groupList}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.groupBubble}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.groupBubble}
            onPress={() => setModalVisible(true)}
          >
            <Text>+ Add group</Text>
          </TouchableOpacity>
        }
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>New Group Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter group name"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddGroup} style={styles.submitBtn}>
                <Text style={{ color: '#fff' }}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

