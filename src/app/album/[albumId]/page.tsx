'use server';

import { getAuthenticatedAppForUser } from "@/library/firebase/serverApp";

import Album from "@/views/album";

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ albumId: string }>
}) {
  const { albumId } = await params;
  const { currentUser } = await getAuthenticatedAppForUser();

  return (
    <Album
      albumId={albumId}
      currentUser={currentUser?.toJSON() as UserInfo}
    />
  );
}