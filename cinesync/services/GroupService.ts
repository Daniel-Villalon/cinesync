// services/GroupService.ts

import { createGroupDoc, addGroupMember } from '../data/groups';
import { FIRESTORE_DB } from '@/FirebaseConfig';
import { doc, setDoc, arrayUnion } from 'firebase/firestore';

/**
 * Creates a new group, adds the user as a member, and links the group to their user profile.
 */
export const createGroup = async (name: string, userId: string): Promise<string> => {
  const groupRef = await createGroupDoc(name, userId);

  await addGroupMember(groupRef.id, userId, 'admin');

  const userRef = doc(FIRESTORE_DB, 'users', userId);
  await setDoc(userRef, {
    groups: arrayUnion(groupRef.id),
  }, { merge: true });

  return groupRef.id;
};

/**
 * Adds a user to an existing group (used when accepting an invite)
 */
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
