import { Metadata } from 'next';
import { User } from "firebase/auth";
import { redirect } from "next/navigation";

import { getAuthenticatedAppForUser } from "@/library/firebase/serverApp";
import { getUserAlbums } from "@/library/firebase/imageServer";

import AlbumGallery from "@/views/albumGallery"

export const metadata: Metadata = {
  title: 'plurr - My image lobbies',
  description: 'Create and share an image lobby with your friends.',
};

export default async function Page() {
  'use server';
  
  const { currentUser } = await getAuthenticatedAppForUser();

  // Redirect to home if not logged in
  if (!currentUser) {
    redirect('/');
  }

  const albumList = await getUserAlbums(currentUser?.uid);

  if (!albumList) {
    redirect('/');
  }

  return <AlbumGallery
    title="My Lobbies"
    currentUser={currentUser?.toJSON() as User}
    path="/my-lobbies"
    initialAlbumList={albumList}
    showNewAlbumBtn
  />;
};
