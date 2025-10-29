'use client';

import React, { useRef, useState, useEffect } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import clx from 'classnames';
import { toast } from 'react-toastify';

import Switch from '@mui/material/Switch';
import CollectionsIcon from '@mui/icons-material/Collections';
import TuneIcon from '@mui/icons-material/Tune';

import { uploadImageAlbum } from '@/library/firebase/image';
import { generateQR, compressFile } from '@/library/utils';

import IconHeader from '@/components/iconHeader';
import TornContainer from '@/components/tornContainer';
import ImageGallery from '@/components/imageGallery';
import Loading from '@/components/loading';
import Button from '@/components/ui/button';
import IconButton from '@/components/ui/iconButton';
import Textfield from '@/components/ui/textfield';

interface NewAlbumProps {
  currentUser: UserInfo | undefined;
}

interface NewImageEntry extends Image {
  file: File;
};

const NewAlbumPage: React.FC<NewAlbumProps> = ({ currentUser }) => {
  const [albumName, setAlbumName] = useState('');
  const [albumId, setAlbumId] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [images, setImages] = useState<NewImageEntry[]>([]);

  const [isStuck, setIsStuck] = useState(false);
  const [viewersCanEdit, setViewersCanEdit] = useState(true);
  const [fullQuality, setFullQuality] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stickyRef = useRef(null);
  const sentinelRef = useRef(null);

  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
      toast.info('Please login to create album.');
    }
  }, [router, currentUser]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // If the sentinel is no longer intersecting, the sticky element is stuck
        setIsStuck(!entry.isIntersecting);
      },
      { threshold: 0 } // Observe when the sentinel enters or exits the viewport
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [loading, currentUser]);

  const handleAlbumNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAlbumName(e.target.value);
  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 75) {
      toast.error('Image count limit is 75.');
    } else {
      setUploadLoading(true);
      const newImages = await Promise.all(files.map((file) => compressFile(file, fullQuality)));
      setImages(prevImages => [...prevImages, ...newImages]);
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (currentUser) {
      const uploadRes = await uploadImageAlbum(
        albumName,
        images.map((image) => image.file),
        currentUser,
        viewersCanEdit,
        fullQuality,
        setUploadProgress,
      );
      if (uploadRes) {
        const qrRes = await generateQR(`${window.location.hostname}/album/${uploadRes}`);
        if (qrRes) setQrCode(qrRes);
        setAlbumId(uploadRes);
      }
    }
    window.scrollTo(0, 0);
    setLoading(false);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, idx) => idx !== index);
    setImages(newImages);
  };

  const handleReorderImage = (idx: number, direction: -1 | 1) => {
    if (idx > 0 && direction == -1) {
      const newImages = [...images];
      [newImages[idx - 1], newImages[idx]] = [newImages[idx], newImages[idx - 1]];
      setImages(newImages);
    }
    else if (idx < images.length - 1 && direction === 1) {
      const newImages = [...images];
      [newImages[idx + 1], newImages[idx]] = [newImages[idx], newImages[idx + 1]];
      setImages(newImages);
    }
  };

  if (loading) return <Loading progress={uploadProgress} />;

  if (qrCode) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <div className="centered-col h-[225px] mt-8 mb-4">
          <h1 className="text-primary">
            That&apos;s it<br />
            Your lobby<br />
            is ready!
          </h1>
        </div>
        <TornContainer>
          <Link href={`/album/${albumId}`} className="underline mb-3">
            <h3>View Album Lobby</h3>
          </Link>
          {qrCode && <Image className="rounded-lg" alt="QR code" width={200} height={200} src={qrCode} />}
          <p className="!text-md font-secondary">Code: {albumId}</p>
        </TornContainer>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <IconHeader showLogin currentUser={currentUser} />
      <TornContainer smallXPadding={images.length > 0} isLoading={uploadLoading}>
        <>
          <h3 className={clx({
            'mb-2': images.length === 0,
          })}>
            Create New<br />
            Album Lobby
          </h3>
          <form onSubmit={handleSubmit} className="centered-col w-full">
            <div ref={sentinelRef} className="h-[1px] w-full" />
            <div
              ref={stickyRef}
              className={clx({
                "w-full bg-primary centered-col transition-colors duration-200": true,
                "!bg-secondary": isStuck,
                "sticky w-screen top-0 z-4 py-4 px-6 flex flex-col justify-center items-center max-w-[576px]": images.length > 0,
              })}
            >
              <Textfield
                label="Enter Album Name"
                required
                fullWidth
                variant={isStuck ? "secondary" : "primary"}
                onChange={handleAlbumNameChange}
                LeadingIcon={<CollectionsIcon sx={{ fontSize: '18px' }} />}
                buttonLabel="Create"
                buttonType="submit"
                buttonDisabled={albumName === ''}
              />

            </div>
            <div className={clx({
              'w-full centered-col': true,
              'mt-4': images.length === 0,
            })}>
              <IconButton
                chevronState={optionsOpen ? 'up' : 'down'}
                onClick={() => setOptionsOpen(!optionsOpen)}
              >
                <span className="text-xs mr-1">options</span><TuneIcon />
              </IconButton>
              <div className={clx({
                "h-[80px]": optionsOpen,
                "transition-[height] duration-150 h-0 overflow-hidden": true,
              })}>
                <div>
                  <Switch
                    checked={viewersCanEdit}
                    onChange={() => setViewersCanEdit(!viewersCanEdit)}
                    color="secondary"
                  />
                  <span className="text-xs">Viewers can add images</span>
                </div>
                <div>
                  <Switch
                    checked={fullQuality}
                    onChange={() => setFullQuality(!fullQuality)}
                    color="secondary"
                  />
                  <span className="text-xs">Full Quality</span>
                </div>
              </div>
            </div>
            {images.length > 0 && (
              <div className="mb-4 w-full">
                <ImageGallery
                  imageList={images}
                  currentUserId={currentUser?.uid}
                  handleRemoveImage={handleRemoveImage}
                  handleReorderImage={handleReorderImage}
                />
              </div>
            )}
            <div className={clx({
              "sticky bottom-4 z-3 w-full flex items-center justify-center": true,
              "mt-6": images.length == 0,
              "px-4": images.length > 0,
            })}>
              <Button fullWidth>
                <label htmlFor="image-upload">
                  + Add Photos
                </label>
              </Button>
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleFilesChange}
              className="hidden"
            />
          </form>
          <Link href="/" className="mt-4 text-sm underline">
            Go Back
          </Link>
        </>
      </TornContainer>
    </div>
  );
};

export default NewAlbumPage;
