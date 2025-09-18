'use client';

import React, { useRef, useState, useEffect } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import clx from 'classnames';
import { toast } from 'react-toastify';

import CollectionsIcon from '@mui/icons-material/Collections';

import { uploadImageAlbum } from '@/library/firebase/image';
import { generateQR } from '@/library/utils';

import useUser from '@/components/hooks/useUser';

import IconHeader from '@/components/iconHeader';
import TornContainer from '@/components/tornContainer';
import ImageGallery from '@/components/imageGallery';
import Button from '@/components/ui/button';
import Textfield from '@/components/ui/textfield';

const NewAlbumPage: React.FC = () => {
  const [albumName, setAlbumName] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isStuck, setIsStuck] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stickyRef = useRef(null);
  const sentinelRef = useRef(null);

  const router = useRouter();
  const { user, userLoading } = useUser();

  useEffect(() => {
    if (!user && !userLoading) {
      router.push('/');
      toast.info('Please login to create album.');
    }
  }, [userLoading, router, user]);

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
  }, []);

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAlbumNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAlbumName(e.target.value);
  };

  // const handleRemoveImage = (index: number) => () => {
  //   const newImages = images.filter((_, idx) => idx !== index);
  //   setImages(newImages);
  //   const newPreviewUrls = previewUrls.filter((_, idx) => idx !== index);
  //   setPreviewUrls(newPreviewUrls);
  // };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = await Promise.all(files.map(fileToDataUrl));
    setImages(prevImages => [...prevImages, ...newImages]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement upload logic
    setLoading(true)
    const uploadRes = await uploadImageAlbum(albumName, images);
    setLoading(false)
    if (uploadRes) {
      const qrRes = await generateQR(`${window.location.hostname}/album/${uploadRes}`);
      console.log(qrRes)
      if (qrRes) setQrCode(qrRes);
      setAlbumId(uploadRes);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <Image src="/loading.gif" alt="loading" width={100} height={100} />
      </div>
    )
  }
  if (qrCode) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <div className="centered-col h-[225px] mb-4">
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
          {qrCode && <Image alt="QR code" width={200} height={200} src={qrCode} />}
        </TornContainer>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <IconHeader isLoading={userLoading} showLogin />
      <TornContainer smallXPadding={images.length > 0} hideChildren={userLoading}>
        <>
          <h3 className={clx({
            'mb-2': images.length === 0,
          })}>
            Create New<br />
            Album Lobby
          </h3>
          <form onSubmit={handleSubmit} className="centered-col w-full">
            <div ref={sentinelRef} style={{ height: '1px' }} /> {/* Sentinel */}
            <div
              ref={stickyRef}
              className={clx({
                "w-full bg-primary transition-colors duration-200": true,
                "!bg-secondary": isStuck,
                "sticky w-screen top-0 z-2 py-4 px-6 flex flex-col justify-center items-center max-w-[576px]": images.length > 0,
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
                buttonDisabled={images.length === 0 || albumName === ''}
              />

            </div>
            {images.length > 0 && (
              <div className="mt-1 mb-4 w-full">
                <ImageGallery images={images} setImages={setImages} />
              </div>
            )}
            {/* {images.length === 0 && */}
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