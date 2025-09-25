'use client';

import React, { useState, useEffect } from "react";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify";
import clx from 'classnames';

import QrCodeIcon from '@mui/icons-material/QrCode';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';

import { generateQR } from '@/library/utils';
import { getAlbumImages } from "@/library/firebase/image";
import useUser from '@/components/hooks/useUser';
import ImageGallery from "@/components/imageGallery";
import UserDropdown from "@/components/ui/userDropdown";
import IconButton from "@/components/ui/iconButton";

export default function AlbumPage({ albumId }: { albumId: string }) {
  const router = useRouter();
  const { user, userLoading } = useUser();

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [albumName, setAlbumName] = useState<string>('');
  const [createdOn, setCreatedOn] = useState<string>('');
  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);

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

  if (loading || userLoading ) {
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
        <div className="pt-6 pl-5 pr-15">
          <h2 className="text-3xl text-secondary font-bold mb-2">{albumName}</h2>
          <p className="pl-3 text-md text-black">{createdOn}</p>
        </div>
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
      <div className="px-2 pb-[50px]">
        <ImageGallery images={images} editMode={editMode} showDownload variant="secondary" />
      </div>

      <div className="fixed w-full bottom-0 z-10">
        <div className="h-[15px] w-full relative">
          <Image
            priority
            src="/tornEdge.png"
            alt="torn edge"
            fill
          />
        </div>
        <div className={clx({
          "h-0": !isQrOpen,
          "h-[225px]": isQrOpen,
          "w-full transition-[height] bg-primary duration-200 ease-in-out overflow-hidden gap-2 flex flex-col items-center justify-center": true,
        })}>
          {qrCode && <Image className="rounded-lg" alt="QR code" width={175} height={175} src={qrCode} />}
          <p className="!text-md font-secondary text-black">Code: {albumId}</p>
        </div>
        <div className="bg-primary text-secondary flex flex-row items-center justify-center gap-20 pb-3">
          <button>
            <span>+</span><ImageIcon />
          </button>
          <button
            type="button"
            onClick={() => setEditMode(!editMode)}
          >
            <EditIcon />
          </button>
          <IconButton
            chevronState={isQrOpen ? 'down' : 'up'}
            onClick={handleQr}
          >
            <QrCodeIcon />
          </IconButton>
        </div>
      </div>
    </main>
  );
}