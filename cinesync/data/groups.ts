// data/groups.ts
import { FIRESTORE_DB } from '@/FirebaseConfig';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';

export const createGroupDoc = async (name: string, userId: string) => {
  const groupRef = await addDoc(collection(FIRESTORE_DB, 'groups'), {
    name,
    createdBy: userId,
    createdAt: serverTimestamp(),
  });
  return groupRef;
};

export const addGroupMember = async (groupId: string, userId: string, role = 'member') => {
  const memberRef = doc(FIRESTORE_DB, `groups/${groupId}/group_members/${userId}`);
  await setDoc(memberRef, {
    joinedAt: serverTimestamp(),
    role: role,
    userId: userId
  });
};
