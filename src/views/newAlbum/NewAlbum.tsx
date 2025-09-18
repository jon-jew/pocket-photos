'use client';

import React, { useRef, useState, useEffect } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { toast } from 'react-toastify';

import CollectionsIcon from '@mui/icons-material/Collections';

import { uploadImageAlbum } from '@/library/firebase/image';
import { generateQR } from '@/library/utils';

import useUser from '@/components/hooks/useUser';

import IconHeader from '@/components/iconHeader';
import TornContainer from '@/components/tornContainer';
import Button from '@/components/ui/button';
import Textfield from '@/components/ui/textfield';

const NewAlbumPage: React.FC = () => {
  const [albumName, setAlbumName] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { user, userLoading } = useUser();

  useEffect(() => {
    if (!user && !userLoading) {
      router.push('/');
      toast.info('Please login to create album.');
    }
  }, [userLoading, router, user]);

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

  const handleRemoveImage = (index: number) => () => {
    const newImages = images.filter((_, idx) => idx !== index);
    setImages(newImages);
    const newPreviewUrls = previewUrls.filter((_, idx) => idx !== index);
    setPreviewUrls(newPreviewUrls);
  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...files, ...images];
    setImages(newImages);

    // Generate preview URLs
    const urls = await Promise.all(newImages.map(fileToDataUrl));

    setPreviewUrls(urls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement upload logic
    setLoading(true)
    const uploadRes = await uploadImageAlbum(albumName, previewUrls);
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
      <TornContainer hideChildren={userLoading}>
        <>
          <h3 className="mb-2">
            Create New<br />
            Album Lobby
          </h3>
          <form onSubmit={handleSubmit} className="centered-col space-y-4 w-full">
            <Textfield
              label="Enter Album Name"
              required
              fullWidth
              onChange={handleAlbumNameChange}
              LeadingIcon={<CollectionsIcon sx={{ fontSize: '18px' }} />}
              buttonLabel="Create"
              buttonType="submit"
            />
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {previewUrls.map((url, idx) => (
                  <div className="relative" key={idx}>
                    <img
                      key={idx}
                      src={url}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage(idx)}
                      className="bg-primary absolute top-0 color-secondary right-0 m-1 p-1 rounded-full"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 w-full">
              <Button fullWidth>
                <label htmlFor="image-upload">
                  + Add Photos
                </label>
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleFilesChange}
                className="hidden"
              />
            </div>
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