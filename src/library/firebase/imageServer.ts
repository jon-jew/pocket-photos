'use server';

import { getDoc, doc, } from 'firebase/firestore';

import { db } from './serverApp';

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