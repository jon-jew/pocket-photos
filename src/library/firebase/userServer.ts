'use server';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

import { db } from './serverApp';
import { getAlbumDaysRemaining } from '../utils';

export const getJoinedAlbums = async (userId: string): Promise<AlbumEntry[] | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();

      const collectionRef = collection(db, 'albums');
      const documentIds = data.joinedAlbums;
      if (documentIds.length === 0) {
        return [];
      }

      const q = query(collectionRef, where('__name__', 'in', documentIds));

      const querySnapshot = await getDocs(q);

      const res = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const firstUploadOn = data.firstUploadOn !== undefined ? data.firstUploadOn : data.createdOn;
        const firstUploadTime = firstUploadOn !== null ? firstUploadOn.toDate().getTime() : null;
        const daysUntilDelete = firstUploadTime !== null ? getAlbumDaysRemaining(Date.now(), firstUploadTime) : -1;

        if (firstUploadTime === null || daysUntilDelete >= 0) {
          return ({
            id: doc.id,
            albumName: data.albumName as string,
            ownerId: data.ownerId,
            firstUploadOn: firstUploadTime,
            thumbnailImage: data.imageList.length !== 0 ?
              data.imageList[0].imageUrl :
              null,
          });
        }
      });
      return res.filter((album) => album !== undefined);
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
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