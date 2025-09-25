'use client';

import React, { useState, useEffect, useRef } from "react";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify";
import clx from 'classnames';

import QrCodeIcon from '@mui/icons-material/QrCode';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import SaveIcon from '@mui/icons-material/Save';

import { generateQR, compressFile } from '@/library/utils';
import { getAlbumImages, editAlbum } from "@/library/firebase/image";

import useUser from '@/components/hooks/useUser';
import ImageGallery from "@/components/imageGallery";
import UserDropdown from "@/components/ui/userDropdown";
import IconButton from "@/components/ui/iconButton";

interface AlbumInfo {
  albumName: string;
  createdOn: string;
  ownerId: string;
  viewersCanEdit: boolean;
};

export default function AlbumPage({ albumId }: { albumId: string }) {
  const router = useRouter();
  const { user, userLoading } = useUser();

  const [loading, setLoading] = useState<boolean>(true);

  const [images, setImages] = useState<ImageEntry[]>([]);
  const [albumInfo, setAlbumInfo] = useState<AlbumInfo | undefined>();

  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const [editMode, setEditMode] = useState<boolean>(false);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [imageChanges, setImageChanges] = useState<ImageChange[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQr = () => {
    setIsQrOpen(!isQrOpen);
  };

  const getImages = async () => {
    const imageRes = await getAlbumImages(albumId);
    if (imageRes) {
      const qrRes = await generateQR(window.location.href);
      if (qrRes) setQrCode(qrRes);
      setImages(imageRes.imageList);
      const dateString = new Date(imageRes.created).toDateString();
      setAlbumInfo({
        albumName: imageRes.albumName,
        ownerId: imageRes.ownerId,
        createdOn: dateString,
        viewersCanEdit: imageRes.viewersCanEdit,
      })
      setLoading(false);
    } else {
      toast.error('Album not found');
      router.push('/');
    }
  };

  useEffect(() => {
    getImages();
  }, []);

  const handleToggleEditMode = () => {
    if (editMode) {
      setEditMode(false);
      setImageChanges([]);
      setIsChanged(false);
    } else {
      setEditMode(true);
      setIsChanged(false);
      setIsQrOpen(false);
      const initialImageChanges = images.map((image) => ({
        ...image,
        uploaded: true,
        change: null,
      }));
      setImageChanges(initialImageChanges);
    }
  };

  const handleRemoveImage = (idx: number) => {
    if (!isChanged) setIsChanged(true);
    setImageChanges((prev) => {
      return prev.map((imageChange, index) => {
        if (index === idx) {
          return { ...imageChange, change: 'delete' }
        }
        return imageChange;
      })
    });
  };

  const handleReorderImage = (idx: number, direction: -1 | 1) => {
    if (!isChanged) setIsChanged(true);

    const newImageChanges = [...imageChanges];
    let i = idx;
    do {
      i += direction;
    } while (imageChanges[i].change === 'delete')
    [newImageChanges[i], newImageChanges[idx]] = [newImageChanges[idx], newImageChanges[i]];
    newImageChanges[i].change = 'moved';
    newImageChanges[idx].change = 'moved';
    setImageChanges(newImageChanges);

  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isChanged) setIsChanged(true);

    const files = Array.from(e.target.files || []);
    if (files.length + imageChanges.length > 75) {
      toast.error('Image count limit is 75.');
    } else {
      const newImages = await Promise.all(files.map(compressFile));
      setImageChanges(prevImages => [...prevImages, ...newImages.map((image) => ({
        id: '',
        uploaderId: user ? user.uid : null,
        previewImageUrl: image.previewUrl,
        imageUrl: '',
        uploaded: false,
        change: 'new',
        file: image.file,
      }))]);
      window.scrollTo(0, document.body.scrollHeight);
    }
  };

  const handleSubmitChanges = async () => {
    setLoading(true);
    await editAlbum(albumId, user?.uid, imageChanges);
    await getImages();
    toast.success('Saved changes!');
    setEditMode(false);
  };

  if (!albumInfo || loading || userLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <Image priority src="/loading.gif" alt="loading" width={100} height={100} />
      </div>
    );
  }
  if (images.length === 0) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">{albumInfo.albumName || 'Loading...'}</h1>
        <p>No images in album</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto">
      <div className="relative bg-primary transition-[height] duration-200 ease-in-out">
        <div className="pt-6 pl-5 pr-15">
          <h2 className="text-3xl text-secondary font-bold mb-2">{albumInfo.albumName}</h2>
          <p className="pl-3 text-md text-black">{albumInfo.createdOn}</p>
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
        <ImageGallery
          images={editMode ?
            imageChanges.filter((imageChange) => imageChange.change !== 'delete').map(
              (imageChange) => imageChange.previewImageUrl
            ) :
            images.map((image) => image.previewImageUrl)
          }
          handleRemoveImage={handleRemoveImage}
          handleReorderImage={handleReorderImage}
          editMode={albumInfo.ownerId === user?.uid ? editMode : false}
          showDownload
          variant="secondary"
        />
      </div>

      <div className="fixed w-full max-w-4xl bottom-0 z-10">
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
        <div className="bg-primary text-secondary  flex flex-row items-center justify-center gap-20 pb-3">
          {editMode &&
            <>
              <button
                className="text-primary text-[12px] bg-secondary px-3 py-1 rounded-lg"
                onClick={handleSubmitChanges}
                disabled={!isChanged}
                type="button"
              >
                Save <SaveIcon sx={{ fontSize: '15px' }} />
              </button>
              <button type="button">
                <label htmlFor="image-upload">
                  <span>+</span><ImageIcon />
                </label>
              </button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleFilesChange}
                className="hidden"
              />
            </>
          }
          {albumInfo.viewersCanEdit || user?.uid === albumInfo.ownerId &&
            <button
              type="button"
              onClick={handleToggleEditMode}
            >
              {editMode && <span>x</span>}<EditIcon />
            </button>
          }
          {!editMode &&
            <IconButton
              chevronState={isQrOpen ? 'down' : 'up'}
              onClick={handleQr}
            >
              <QrCodeIcon />
            </IconButton>
          }
        </div>
      </div>
    </main>
  );
}