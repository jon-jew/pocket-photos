'use client';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { toast } from 'react-toastify';

import { db } from './clientApp';

export const createReport = async (
  albumId: string,
  email: string,
  desc: string,
) => {
  try {
    await addDoc(collection(db, 'reports'), {
      albumId,
      createdOn: serverTimestamp(),
      email,
      desc,
      status: 'open',
    });

    toast.success('Created report. Please check email for updates.');
    return true;
  } catch (error) {
    console.error(`Error creating report: ${error}`);
    toast.error('Failed to create report.');
    return false;
  }
};
