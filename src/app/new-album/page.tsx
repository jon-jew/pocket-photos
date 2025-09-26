'use server';

import { getAuthenticatedAppForUser } from "@/library/firebase/serverApp";

import NewAlbum from "@/views/newAlbum";

export default async function NewAlbumPage() {
  const { currentUser } = await getAuthenticatedAppForUser();

  return <NewAlbum currentUser={currentUser?.toJSON() as UserInfo} />;
};
