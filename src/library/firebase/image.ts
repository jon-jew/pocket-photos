import { v4 as uuidv4 } from "uuid";

import {
  collection,
  doc,
  arrayUnion,
  serverTimestamp,
  addDoc,
  getDoc,
  getFirestore,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  getDocsFromCache,
  deleteDoc,
  setDoc,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { ref, uploadString, deleteObject, getDownloadURL } from "firebase/storage";

import { storage, db } from "./clientApp";

const uploadImages = async (albumId: string, images: string[]) => {
  const imageList: string[] = [];
  for (const [index, image] of images.entries()) {
    const imageRef = ref(storage, `/${albumId}/${index}`);
    const uploadRes = await uploadString(imageRef, image, "data_url");
    console.log(uploadRes)
    const imageUrl = await getDownloadURL(imageRef);
    imageList.push(imageUrl);

  }
  console.log(imageList)
  return imageList;
}

export const uploadImageAlbum = async (albumName: string, images: string[]) => {
  try {
    const albumId = uuidv4();
    const imageList: string[] = await uploadImages(albumId, images);
    console.log('after image list')
    const albumData = {
      albumName: albumName,
      created: Date.now(),
      imageList: imageList,
    };

    await setDoc(doc(db, "albums", albumId), albumData);

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
      console.log("No such document!");
    }

  } catch (error) {
    console.error(error)
    return false;
  }
}

