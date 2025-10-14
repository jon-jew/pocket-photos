'use server';

import { getAuthenticatedAppForUser } from "@/library/firebase/serverApp";
import { getAlbumImages } from "@/library/firebase/imageServer";

import Album from "@/views/album";

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ albumId: string }>
}) {
  const { albumId } = await params;
  const { currentUser } = await getAuthenticatedAppForUser();

  const albumData = await getAlbumImages(albumId);
  if (!albumData) {
    return (
      <div className="flex flex-col items-center justify-center h-full"> 
        <h1 className="text-2xl font-bold mb-4">Album Not Found</h1>
        <p className="text-gray-600">The album you are looking for does not exist or has been deleted.</p>
      </div>
    );
  }

  return (
    <Album
      albumId={albumId}
      initialAlbumInfo={albumData?.albumInfo}
      initialImages={albumData?.imageList || []}
      currentUser={currentUser?.toJSON() as UserInfo}
    />
  );
}