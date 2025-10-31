import { Metadata } from 'next';

import { getAuthenticatedAppForUser } from "@/library/firebase/serverApp";

import NewAlbum from "@/views/newAlbum";

export const metadata: Metadata = {
  title: 'plurr - New image lobby',
  description: 'Create and share an image lobby with your friends.',
};

export default async function NewAlbumPage() {
  'use server';
  
  const { currentUser } = await getAuthenticatedAppForUser();

  return <NewAlbum initialUser={currentUser?.toJSON() as UserInfo} />;
};
