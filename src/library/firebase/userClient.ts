'use client';

import {
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
  updateDoc,
} from 'firebase/firestore';
import { toast } from 'react-toastify';

import { db } from './clientApp';

export const createUserEntry = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        joinedAlbums: [],
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export const checkJoinedAlbums = async (albumId: string, userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return data.joinedAlbums.includes(albumId);
    }
    return false;
   } catch (error) {
    console.error(error);
    return false;
  }
};

export const setJoinedAlbums = async (albumId: string, userId: string, remove: boolean) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      if (!remove) {
        if (!data?.joinedAlbums.includes(albumId)) {
          await updateDoc(userRef, {
            joinedAlbums: arrayUnion(albumId),
          });
          toast.success('Added to joined lobby list!');
        }
      } else {
        await updateDoc(userRef, {
          joinedAlbums: arrayRemove(albumId)
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
};
