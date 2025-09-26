import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

import { storage, db } from './clientApp';
import { toast } from 'react-toastify';

declare global {
  interface UserAlbum {
    id: string;
    albumName: string;
    created: string;
    thumbnailImage: string;
  }

  interface Image {
    id: string;
    imageUrl: string;
    uploaderId: string | null;
  }

  interface ImageEntry extends Image {
    previewImageUrl: string;
  }

  interface ImageChange extends ImageEntry {
    uploaded: boolean;
    change: string | null;
    file?: File;
  }
}

const doesAlbumExist = async (albumId: string) => {
  const albumRef = doc(db, 'albums', albumId);
  const docSnap = await getDoc(albumRef);
  if (docSnap.exists()) return true;
  return false;
};

const generateRandomId = (length = 6) => {
  return Math.random().toString(36).substring(2, length + 2);
};

export const uploadImageAlbum = async (
  albumName: string,
  images: File[],
  userUid: string,
  viewersCanEdit: boolean,
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>
) => {
  try {
    let albumId = '';
    do {
      albumId = generateRandomId();
    } while (!doesAlbumExist(albumId))

    const progressIncrement: number = 1 / (images.length * 2) * 100;
    // const apiPromises = images.map(async (image, index) => {
    //   const formData = new FormData();
    //   formData.append(`image`, image, `album-img-${index}`);
    //   const res = await fetch('/api/upload', {
    //     method: 'POST',
    //     body: formData,
    //   });
    //   setUploadProgress((prev) => prev + progressIncrement);
    // });
    // await Promise.all(apiPromises)

    const promises = images.map(async (image, index) => {
      const imageId = generateRandomId();
      const imageRef = ref(storage, `/${albumId}/${imageId}`);
      const uploadRes = await uploadBytes(imageRef, image);
      setUploadProgress((prev) => prev + progressIncrement);
      const imageUrl = await getDownloadURL(imageRef);
      setUploadProgress((prev) => prev + progressIncrement);
      return ({ id: imageId, uploaderId: userUid, imageUrl, });
    });

    const imageList = await Promise.all(promises);

    const albumData = {
      albumName: albumName,
      ownerId: userUid,
      viewersCanEdit: viewersCanEdit,
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
      const blobs = await Promise.all(data.imageList.map(
        (image: Image) => XHRRequest(image.imageUrl)
      ));
      return ({
        created: data.created,
        albumName: data.albumName,
        ownerId: data.ownerId,
        viewersCanEdit: data.viewersCanEdit,
        imageList: blobs.map((blob, index) => ({
          id: data.imageList[index].id,
          uploaderId: data.imageList[index].uploaderId,
          imageUrl: data.imageList[index].imageUrl,
          previewImageUrl: URL.createObjectURL(blob),
        })),
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
        const thumbnailImage = await XHRRequest(data.imageList[0].imageUrl);
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

export const editAlbumImages = async (
  albumId: string,
  userId: string | undefined,
  changes: ImageChange[],
  deletedImages: ImageChange[]
) => {
  try {
    const deletePromises = deletedImages.map(async (change) => {
      const imageRef = ref(storage, `/${albumId}/${change.id}`);
      await deleteObject(imageRef);
    });

    const newImageList: Image[] = new Array(changes.length);
    const promises = changes.map(async (change, index) => {
      if (change.file && !change.uploaded) {
        const imageId = generateRandomId();
        const imageRef = ref(storage, `/${albumId}/${imageId}`);
        await uploadBytes(imageRef, change.file);
        const imageUrl = await getDownloadURL(imageRef);
        newImageList[index] = {
          id: imageId,
          uploaderId: userId ? userId : 'anonymous',
          imageUrl,
        };
      } else {
        newImageList[index] = {
          id: change.id,
          uploaderId: change.uploaderId ? change.uploaderId : null,
          imageUrl: change.imageUrl,
        };
      }
    });

    await Promise.all([...promises, ...deletePromises]);
    const albumRef = doc(db, 'albums', albumId);
    await updateDoc(albumRef, {
      imageList: newImageList,
    });

  } catch (error) {
    console.error(error);
    toast.error('Failed to save changes');
    return false;
  }
};

export const editAlbumFields = async (albumId: string, albumName: string, viewersCanEdit: boolean) => {
  try {
    const albumRef = doc(db, 'albums', albumId);
    await updateDoc(albumRef, {
      albumName,
      viewersCanEdit,
    });

    return true;

  } catch (error) {
    console.error(error);
    toast.error('Failed to save changes');
    return false;
  }
};

export const deleteAlbum = async (albumId: string) => {
  try {
    const albumRef = doc(db, 'albums', albumId);
    const docSnap = await getDoc(albumRef);
    if (docSnap.exists()) {
      const { imageList } = docSnap.data();
      const promises = imageList.map(async (image: Image) => {
        const imageRef = ref(storage, `/${albumId}/${image.id}`);
        await deleteObject(imageRef);
      });
      await Promise.all(promises);
      await deleteDoc(doc(db, 'albums', albumId));
      return true;
    } else {
      toast.error('Album not found');
      return false;
    }

  } catch (error) {
    console.error(error);
    toast.error('Failed to delete album');
    return false;
  }
};
