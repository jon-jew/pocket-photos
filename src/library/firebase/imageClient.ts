'use client';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

import { toast } from 'react-toastify';

import { storage, db } from './clientApp';
import { streamToObject, getTimeDifference } from '../utils';

declare global {
  interface AlbumEntry {
    id?: string;
    ownerId: string;
    albumName: string;
    firstUploadOn: number;
    thumbnailImage?: string;
  }

  interface Image {
    imageUrl: string;
  }

  interface ImageEntry extends Image {
    previewImageUrl: string;
  }

  interface NewImageEntry extends Image {
    file: File;
  }

  interface GalleryImageEntry extends Image {
    id: string;
    uploaderId: string | null;
    reactions: ImageReaction[];
    reactionString: string;
  }

  interface ImageReaction {
    userId: string;
    reaction: string;
  }

  interface ImageReactionEntry {
    selectedReaction: string | null | undefined;
    reactionString: string;
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

export const uploadImagesToAlbum = async (
  albumId: string,
  images: File[],
  currentUser: UserInfo | undefined,
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>
) => {
  if (images.length === 0) {
    toast.error('Please select images to upload.');
    return false;
  }

  try {
    const albumRef = doc(db, 'albums', albumId);
    const docSnap = await getDoc(albumRef);
    if (docSnap.exists()) {
      const {
        viewersCanEdit,
        ownerId,
        imageList,
        firstUploadOn,
      } = docSnap.data();
      let userToken: string | undefined = undefined;

      if (
        (ownerId === currentUser?.uid) ||
        (viewersCanEdit && ownerId !== currentUser?.uid)
      ) {
        userToken = currentUser?.stsTokenManager.accessToken;
      } else if (!viewersCanEdit) {
        toast.error('Unauthorized to upload photos');
        return false;
      }
      const imagePromises = images.map(async (image: File, index: number) => {
        const endpoint = `/api/upload-to-album`;
        const headers = new Headers();
        if (userToken) headers.append('Authorization', `Bearer ${userToken}`);
        const formData = new FormData();
        formData.append(`image`, image, `album-img-${index}`);
        formData.append('albumId', albumId);
        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: formData,
        });
        if (res.body && res.ok) {
          const body = await streamToObject(res.body);
          // setUploadProgress((prev) => prev + (1 / images.length) * 100);
          return body;
        }
      })
      const addedImageList = await Promise.all(imagePromises);

      await updateDoc(albumRef, {
        firstUploadOn: firstUploadOn ? firstUploadOn : serverTimestamp(),
        imageList: [...imageList, ...addedImageList],
      });
      return true;
    } else {
      toast.error('Album does not exist');
      return false;
    }
  } catch (error) {
    console.error(error);
    toast.error('Failed to upload images');
    return false;
  }
};

export const uploadImageAlbum = async (
  albumName: string,
  images: File[],
  currentUser: UserInfo,
  viewersCanEdit: boolean,
  isFullQuality: boolean,
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>
) => {
  try {
    if (!currentUser) {
      toast.error('Please login to create album.');
      return false;
    }

    const idToken = await currentUser.stsTokenManager.accessToken;
    if (!idToken) {
      toast.error('Failed to get user token. Please login again.');
      return false;
    }

    let albumId = '';
    do {
      albumId = generateRandomId();
    } while (!doesAlbumExist(albumId));

    const progressIncrement: number = 1 / (images.length * 1) * 100;
    const apiPromises = images.map(async (image, index) => {
      const formData = new FormData();
      formData.append(`image`, image, `album-img-${index}`);
      formData.append('info', JSON.stringify({
        isFullQuality, albumId,
      }));
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: formData,
      });
      if (res.body && res.ok) {
        const body = await streamToObject(res.body);
        setUploadProgress((prev) => prev + progressIncrement);
        return ({
          ...body,
          reactions: [],
          reactionString: '',
        });
      }
    });
    const imageList = await Promise.all(apiPromises);
    // const promises = images.map(async (image, index) => {
    //   const imageId = generateRandomId();
    //   const imageRef = ref(storage, `/${albumId}/${imageId}`);
    //   const uploadRes = await uploadBytes(imageRef, image);
    //   setUploadProgress((prev) => prev + progressIncrement);
    //   const imageUrl = await getDownloadURL(imageRef);
    //   setUploadProgress((prev) => prev + progressIncrement);
    //   return ({ id: imageId, uploaderId: userUid, imageUrl, });
    // });

    // const imageList = await Promise.all(promises);

    const albumData = {
      albumName: albumName,
      ownerId: currentUser?.uid,
      viewersCanEdit: viewersCanEdit,
      createdOn: serverTimestamp(),
      firstUploadOn: imageList.length !== 0 ? serverTimestamp() : null,
      imageList: imageList,
      isFullQuality
    };

    await setDoc(doc(db, 'albums', albumId), albumData);

    return albumId;
  } catch (error) {
    console.error(error);
    toast.error('Failed to create album');
    return false;
  }
};

export const XHRRequest = (imageUrl: string): Promise<Blob> => {
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
      const createdOn = new Date(data.createdOn.toDate()).getTime();
      const firstUploadOn = data.firstUploadOn !== undefined ? data.firstUploadOn : data.createdOn;
      const firstUploadTime = firstUploadOn !== null ? firstUploadOn.toDate().getTime() : null;

      return ({
        createdOn,
        dateString: getTimeDifference(createdOn, false),
        albumName: data.albumName,
        firstUploadOn: firstUploadTime,
        ownerId: data.ownerId,
        viewersCanEdit: data.viewersCanEdit,
        imageList: data.imageList,
      });
    } else {
      // docSnap.data() will be undefined in this case
      console.error('No such document!');
      return null;
    }

  } catch (error) {
    console.error(error)
    return false;
  }
};

export const editAlbumImages = async (
  albumId: string,
  userId: string | undefined,
  editedImageList: GalleryImageEntry[],
  deletedImageIds: string[]
) => {
  try {
    const deletePromises = deletedImageIds.map(async (id) => {
      const imageRef = ref(storage, `/albums/${albumId}/${id}.jpg`);
      await deleteObject(imageRef);
    });
    await Promise.all(deletePromises);

    const albumRef = doc(db, 'albums', albumId);
    await updateDoc(albumRef, {
      imageList: editedImageList,
    });
  } catch (error) {
    console.error(error);
    toast.error('Failed to save changes');
    return false;
  }
};

export const handleImageReaction = async (userId: string, reaction: string, albumId: string, imageIndex: number) => {
  try {
    const albumRef = doc(db, 'albums', albumId);
    const docSnap = await getDoc(albumRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const imageList: GalleryImageEntry[] = data.imageList;
      const imageEntry = imageList[imageIndex];
      const reactions = imageEntry.reactions ? [...imageEntry.reactions] : [];
      const foundIndex = reactions.findIndex(
        (reaction: ImageReaction) => reaction.userId === userId
      );

      if (foundIndex !== -1) {
        if (reactions[foundIndex].reaction === reaction || reaction === 'like') {
          reactions.splice(foundIndex, 1);
        } else {
          reactions[foundIndex].reaction = reaction;
        }
      } else {
        reactions.push({
          userId,
          reaction
        });
      }

      const displayReactions: string[] = [];
      for (let i = 0; i < reactions.length && displayReactions.length < 4; i++) {
        if (
          !displayReactions.includes(reactions[i].reaction) &&
          reactions[i].reaction !== 'like'
        ) {
          displayReactions.push(reactions[i].reaction);
        }
      }
      const reactionString = displayReactions.join('');

      imageList[imageIndex].reactions = reactions;
      imageList[imageIndex].reactionString = reactionString;
      await updateDoc(albumRef, { imageList });

      return `${reactionString} ${reactions.length}`;
    }
    console.error('Album id not found');
    return false;

  } catch (error) {
    console.error(error);
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
      const promises = imageList.map(async (image: GalleryImageEntry) => {
        const imageRef = ref(storage, `albums/${albumId}/${image.id}.jpg`);
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
