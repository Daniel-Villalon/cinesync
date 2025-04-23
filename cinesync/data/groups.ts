// data/groups.ts
import { FIRESTORE_DB } from '../FirebaseConfig';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  query,
  where,
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
  const memberRef = doc(FIRESTORE_DB, 'groups', groupId, 'group_members', userId);
  await setDoc(memberRef, { userId, role });
};

export const getUserGroups = async (userId: string) => {
  // This requires a reverse mapping or indexing strategy; Firestore doesn't natively support subcollection queries across all documents
  // One common pattern is to maintain a `/memberships` collection or embed metadata at group level
};
