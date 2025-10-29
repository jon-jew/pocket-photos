import { Metadata } from 'next';
import { User } from "firebase/auth";
import { redirect } from "next/navigation";

import { getAuthenticatedAppForUser } from "@/library/firebase/serverApp";
import { getJoinedAlbums } from "@/library/firebase/userServer";

import AlbumGallery from "@/views/albumGallery";

export const metadata: Metadata = {
  title: 'plurr - Joined lobbies',
  description: 'Create and share an image lobby with your friends.',
};

export default async function JoinedLobbiesPage() {
  'use server';

  const { currentUser } = await getAuthenticatedAppForUser();

  // Redirect to home if not logged in
  if (!currentUser) {
    redirect('/');
  }

  const albumList = await getJoinedAlbums(currentUser?.uid);

  if (!albumList) {
    redirect('/');
  }

  return <AlbumGallery
    title="Joined Lobbies"
    currentUser={currentUser?.toJSON() as User}
    path="/joined-lobbies"
    initialAlbumList={albumList}
  />;
};
