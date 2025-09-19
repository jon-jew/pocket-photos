import { v4 as uuidv4 } from 'uuid';

import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { storage, db } from './clientApp';

const uploadImages = async (albumId: string, images: File[]) => {
  const imageList: string[] = [];
  for (const [index, image] of images.entries()) {
    const imageRef = ref(storage, `/${albumId}/${index}`);
    const uploadRes = await uploadBytes(imageRef, image);
    const imageUrl = await getDownloadURL(imageRef);
    imageList.push(imageUrl);

  }
  return imageList;
}

export const uploadImageAlbum = async (albumName: string, images: File[], userUid: string) => {
  try {
    const albumId = uuidv4();
    const imageList: string[] = await uploadImages(albumId, images);
    const albumData = {
      albumName: albumName,
      ownerId: userUid,
      created: Date.now(),
      imageList: imageList,
    };

    await setDoc(doc(db, 'albums', albumId), albumData);

    return albumId;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export const getAlbumImages = async (albumId: string) => {
  try {
    const albumRef = doc(db, 'albums', albumId);
    const docSnap = await getDoc(albumRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data;
    } else {
      // docSnap.data() will be undefined in this case
      console.log('No such document!');
      return null;
    }

  } catch (error) {
    console.error(error)
    return false;
  }
}
