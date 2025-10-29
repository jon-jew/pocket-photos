import { Metadata } from 'next';
import { getAuthenticatedAppForUser } from "@/library/firebase/serverApp";
import { getAlbumImages } from "@/library/firebase/imageServer";
import { checkJoinedAlbums } from "@/library/firebase/userServer";

import Album from "@/views/album";
import Button from "@/components/ui/button";

export const metadata: Metadata = {
  title: 'plurr - Image lobby',
  description: 'Create and share an image lobby with your friends.',
};

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ albumId: string }>
}) {
  'use server';

  const { albumId } = await params;
  const { currentUser } = await getAuthenticatedAppForUser();

  const albumData = await getAlbumImages(albumId);
  if (!albumData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-8 py-10 gap-4">
        <h1 className="!text-4xl font-bold mb-4 text-primary">Lobby Not Found</h1>
        <p className="text-gray-200 mb-10">The lobby you are looking for does not exist or has been deleted.</p>
        <Button variant="secondary" href="/">Home</Button>
      </div>
    );
  }
  let foundJoinedAlbum = false;
  if (currentUser) {
    foundJoinedAlbum = await checkJoinedAlbums(albumId, currentUser.uid);
  }

  return (
    <Album
      albumId={albumId}
      initialAlbumInfo={albumData?.albumInfo}
      initialImages={albumData?.imageList || []}
      initialJoined={foundJoinedAlbum}
      currentUser={currentUser?.toJSON() as UserInfo}
    />
  );
}