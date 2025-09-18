'use client';

import React, { useState, useEffect } from "react";
import CircularProgress from '@mui/material/CircularProgress';

import { getAlbumImages } from "@/library/firebase/image";

export default function AlbumPage({ albumId }: { albumId: string }) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [albumName, setAlbumName] = useState<string>('');

  const getImages = async () => {
    const imageRes = await getAlbumImages(albumId);
    if (imageRes) {
      setImages(imageRes.imageList);
      setAlbumName(imageRes.albumName);
    }
    setLoading(false);
  }

  useEffect(() => {
    getImages();
  }, [getImages]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">{albumName}</h1>
        <CircularProgress />
      </main>
    );
  }
  if (images.length === 0) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">{albumName || 'Loading...'}</h1>
        <p>No images in album</p>
      </main>
    );
  }
  
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{albumName}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((image, idx) => (
          <div
            key={image}
            className="rounded shadow hover:shadow-lg transition overflow-hidden bg-white"
          >
            <img
              src={image}
              alt={`Photo ${idx + 1}`}
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