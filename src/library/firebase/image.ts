import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { storage, db } from './clientApp';
import { toast } from 'react-toastify';

const doesAlbumExist = async (albumId: string) => {
  const albumRef = doc(db, 'albums', albumId);
  const docSnap = await getDoc(albumRef);
  if (docSnap.exists()) return true;
  return false;
}
export const uploadImageAlbum = async (
  albumName: string,
  images: File[],
  userUid: string,
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>
) => {
  try {
    let albumId = '';
    do {
      albumId = Math.random().toString(36).substring(2, 8);
    } while (!doesAlbumExist(albumId))

    const imageList: string[] = [];
    const progressIncrement: number = 1 / (images.length * 2) * 100;

    for (const [index, image] of images.entries()) {
      const imageRef = ref(storage, `/${albumId}/${index}`);
      const uploadRes = await uploadBytes(imageRef, image);
      setUploadProgress((prev) => prev + progressIncrement);
      const imageUrl = await getDownloadURL(imageRef);
      setUploadProgress((prev) => prev + progressIncrement);
      imageList.push(imageUrl);
    }
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
};

const XHRRequest = (imageUrl: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = () => {
      const blob = xhr.response;
      resolve(blob);
    };
    xhr.onerror = () => {
      toast.error('Failed to get image');
    }
    xhr.open('GET', imageUrl);
    xhr.send();
  });
};

export const getAlbumImages = async (albumId: string) => {
  try {
    const albumRef = doc(db, 'albums', albumId);
    const docSnap = await getDoc(albumRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const blobs = await Promise.all(data.imageList.map(XHRRequest))
      return ({
        created: data.created,
        albumName: data.albumName,
        imageList: blobs.map((blob) => URL.createObjectURL(blob)),
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
