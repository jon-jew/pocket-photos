'use client';

import {
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  updateDoc,
} from 'firebase/firestore';

import { db } from './clientApp';

export const createUserEntry = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      viewedAlbums: [],
    });
  }
};

export const setViewedAlbums = async (newAlbumId: string, userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef,{
      viewedAlbums: arrayUnion(newAlbumId),
    });
  } catch (error) {
    console.error(error);
  }
};
