'use client';

import React, { useState } from "react";

import { getAlbumImages } from "@/library/firebase/image";

type Photo = {
  id: string;
  url: string;
  title: string;
};

const mockPhotos: Photo[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
    title: "Mountain View",
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400",
    title: "Forest Path",
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400",
    title: "City Lights",
  },
];

export default function AlbumPage({ albumId }: { albumId: string }) {
  const [images, setImages] = useState<Photo[]>([]);
  const [albumName, setAlbumName] = useState<string>('');

  const getImages = async () => {
    const imageRes = await getAlbumImages(albumId);
    if (imageRes) {
      setImages(imageRes.imageList);
      setAlbumName(imageRes.albumName);
    }
  }

  getImages();

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{albumName}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((image) => (
          <div
            key={'test'}
            className="rounded shadow hover:shadow-lg transition overflow-hidden bg-white"
          >
            <img
              src={image}
              // alt={photo.title}
              className="w-full h-48 object-cover"
            />
            {/* <div className="p-4">
              <h2 className="text-lg font-semibold">{photo.title}</h2>
            </div> */}
          </div>
        ))}
      </div>
    </main>
  );
}