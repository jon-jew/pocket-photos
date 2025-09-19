'use client';

import React, { useState, useEffect } from "react";

import Image from 'next/image';

import { getAlbumImages } from "@/library/firebase/image";
import ImageGallery from "@/components/imageGallery";

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
      <div className="flex flex-col min-h-screen items-center justify-center">
        <Image src="/loading.gif" alt="loading" width={100} height={100} />
      </div>
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
        <ImageGallery images={images} />
      </div>
    </main>
  );
}