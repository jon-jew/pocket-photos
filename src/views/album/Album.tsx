'use client';

import React, { useState, useEffect } from "react";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify";
import clx from 'classnames';

import QrCodeIcon from '@mui/icons-material/QrCode';

import { generateQR } from '@/library/utils';
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
  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string | null>(null);


  const handleQr = () => {
    setIsQrOpen(!isQrOpen);
  };

  const getImages = async () => {
    const imageRes = await getAlbumImages(albumId);
    if (imageRes) {
      const qrRes = await generateQR(window.location.href);
      if (qrRes) setQrCode(qrRes);
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
      <div className="relative bg-primary transition-[height] duration-200 ease-in-out">
        <div className="pt-6 pl-5 pr-15 mb-1">
          <h2 className="text-4xl text-secondary font-bold mb-4">{albumName}</h2>
          <p className="pl-3 text-md text-black">{createdOn}</p>
        </div>
        <div className="absolute top-5 right-[5px] z-10">
          <UserDropdown variant="secondary" />
        </div>
        <div className={clx({
          "h-0": !isQrOpen,
          "h-[225px]": isQrOpen,
          "w-full transition-[height] duration-200 ease-in-out overflow-hidden gap-2 flex flex-col items-center justify-center": true,
        })}>
          {qrCode && <Image className="rounded-lg" alt="QR code" width={175} height={175} src={qrCode} />}
          <p className="!text-md font-secondary text-black">Code: {albumId}</p>
        </div>
        <div className="mt-1 w-full flex items-center justify-center">
          <button
            onClick={handleQr}
            className="flex flex-row justify-center items-center text-secondary"
          >
            <QrCodeIcon />
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
              className={clx({
                'rotate-180': isQrOpen,
              })}
            >
              <path
                d="M5 8l5 5 5-5"
                stroke="#070217"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
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