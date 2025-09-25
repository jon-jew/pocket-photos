import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { storage, db } from './clientApp';
import { toast } from 'react-toastify';

declare global {
  interface UserAlbum {
    id: string;
    albumName: string;
    created: string;
    thumbnailImage: string;
  }
}

const doesAlbumExist = async (albumId: string) => {
  const albumRef = doc(db, 'albums', albumId);
  const docSnap = await getDoc(albumRef);
  if (docSnap.exists()) return true;
  return false;
};

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

    const progressIncrement: number = 1 / (images.length * 2) * 100;

    const promises = images.map(async (image, index) => {
      const imageRef = ref(storage, `/${albumId}/${index}`);
      const uploadRes = await uploadBytes(imageRef, image);
      setUploadProgress((prev) => prev + progressIncrement);
      const imageUrl = await getDownloadURL(imageRef);
      setUploadProgress((prev) => prev + progressIncrement);
      return imageUrl;
    });

    const imageList = await Promise.all(promises);

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

export const getUserAlbums = async (userId: string) => {
  try {
    const albumsRef = collection(db, 'albums');
    const q = query(albumsRef, where("ownerId", "==", userId));

    const querySnapshot = await getDocs(q);
    const promises = querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      if (data.imageList.length !== 0) {
        const thumbnailImage = await XHRRequest(data.imageList[0]);
        return ({
          id: doc.id,
          albumName: data.albumName as string,
          thumbnailImage: URL.createObjectURL(thumbnailImage),
          created: new Date(data.created).toDateString(),
        });
      }
    });
    const res = await Promise.all(promises);
    return res as UserAlbum[];

  } catch (error) {
    console.error(error);
    return false;
  }
};
