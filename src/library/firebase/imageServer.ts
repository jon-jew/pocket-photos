'use server';

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';

import { db } from './serverApp';
import { getAlbumDaysRemaining, getTimeDifference } from '../utils';

export const getAlbumImages = async (albumId: string) => {
  try {
    const albumRef = doc(db, 'albums', albumId);
    const docSnap = await getDoc(albumRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const createdOn = new Date(data.createdOn.toDate()).getTime();
      const firstUploadOn = data.firstUploadOn !== undefined ? data.firstUploadOn : data.createdOn;
      const firstUploadTime = firstUploadOn !== null ? firstUploadOn.toDate().getTime() : null;

      return ({
        albumInfo: {
          createdOn,
          dateString: getTimeDifference(createdOn, false),
          albumName: data.albumName,
          firstUploadOn: firstUploadTime,
          ownerId: data.ownerId,
          viewersCanEdit: data.viewersCanEdit,
        },
        imageList: data.imageList,
      });
    } else {
      // docSnap.data() will be undefined in this case
      console.log('No such document!');
      return null;
    }

  } catch (error) {
    console.error(error)
    return false;
  }
};

export const getUserAlbums = async (userId: string): Promise<AlbumEntry[] | false> => {
  try {
    const albumsRef = collection(db, 'albums');
    const q = query(albumsRef, where("ownerId", "==", userId), orderBy('createdOn', 'desc'));

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
  } catch (error) {
    console.error(error);
    return false;
  }
};
