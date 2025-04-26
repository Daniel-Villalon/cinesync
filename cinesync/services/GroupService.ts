// services/GroupService.ts
import { createGroupDoc, addGroupMember } from '../data/groups';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import { doc,setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export const createGroup = async (name: string, userId: string): Promise<string> => {
  // 1. Create the group document
  const groupRef = await createGroupDoc(name, userId);

  // 2. Add user to group_members subcollection
  await addGroupMember(groupRef.id, userId, 'admin');

  // 3. Update the user's group list
  const userRef = doc(FIRESTORE_DB, 'users', userId);
  await updateDoc(userRef, {
    groups: arrayUnion(groupRef.id),
  });

  return groupRef.id;
};

export const addUserToGroup = async (groupId: string, userId: string): Promise<void> => {
  const memberRef = doc(FIRESTORE_DB, `groups/${groupId}/group_members/${userId}`);
  await setDoc(memberRef, {
    joinedAt: new Date(),
    role: 'member',
  }, { merge: true });

  const userRef = doc(FIRESTORE_DB, 'users', userId);
  await setDoc(userRef, {
    groups: arrayUnion(groupId),
  }, { merge: true });
};