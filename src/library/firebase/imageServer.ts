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
import { getAlbumHoursRemaining } from '../utils';

export const getAlbumImages = async (albumId: string) => {
  try {
    const albumRef = doc(db, 'albums', albumId);
    const docSnap = await getDoc(albumRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const dateString = new Date(data.createdOn.toDate()).toDateString();
      return ({
        albumInfo: {
          createdOn: new Date(data.createdOn.toDate()).getTime(),
          dateString: dateString,
          albumName: data.albumName,
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

export const getUserAlbums = async (userId: string) => {
  try {
    const albumsRef = collection(db, 'albums');
    const q = query(albumsRef, where("ownerId", "==", userId), orderBy('createdOn', 'desc'));

    const querySnapshot = await getDocs(q);
    const res = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      const createdOn = data.createdOn.toDate().getTime();
      const hoursRemaining = getAlbumHoursRemaining(createdOn);

      if (hoursRemaining >= 0) {
        return ({
          id: doc.id,
          albumName: data.albumName as string,
          ownerId: data.ownerId,
          hoursRemaining,
          thumbnailImage: data.imageList.length !== 0 ?
            data.imageList[0].imageUrl :
            null,
          createdOn,
        });
      }
    });

    return res.filter((album) => album !== undefined);
  } catch (error) {
    console.error(error);
    return false;
  }
};