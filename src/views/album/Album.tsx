'use client';

import React, { useState, useEffect } from "react";

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { toast } from "react-toastify";

import { getAlbumImages } from "@/library/firebase/image";
import useUser from '@/components/hooks/useUser';
import ImageGallery from "@/components/imageGallery";
import UserDropdown from "@/components/ui/userDropdown";

export default function AlbumPage({ albumId }: { albumId: string }) {
  const router = useRouter();
  const { user, userLoading } = useUser();

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [albumName, setAlbumName] = useState<string>('');
  const [createdOn, setCreatedOn] = useState<string>('');

  const getImages = async () => {
    const imageRes = await getAlbumImages(albumId);
    if (imageRes) {
      setImages(imageRes.imageList);
      setAlbumName(imageRes.albumName);
      setLoading(false);
      setCreatedOn(new Date(imageRes.created).toDateString());
    } else {
      toast.error('Album not found');
      router.push('/');
    }
  };

  useEffect(() => {
    getImages();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <Image priority src="/loading.gif" alt="loading" width={100} height={100} />
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
    <main className="max-w-4xl mx-auto">
      <div className="relative bg-primary pt-6 pl-5 pr-15">
        <h2 className="text-4xl text-secondary font-bold mb-4">{albumName}</h2>
        <p className="pl-3 text-md text-black">{createdOn}</p>
        <div className="absolute top-5 right-[5px] z-10">
          <UserDropdown variant="secondary" />
        </div>
      </div>

      <div className="h-[20px] w-full rotate-180 relative">
        <Image
          priority
          src="/tornEdge.png"
          alt="torn edge"
          fill
        />
      </div>
      <div className="">
        <ImageGallery images={images} hideRemove showDownload variant="secondary" />
      </div>
    </main>
  );
}