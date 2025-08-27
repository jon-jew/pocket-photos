'use client';

import React, { useRef, useState } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import CircularProgress from '@mui/material/CircularProgress';

import { uploadImageAlbum } from '@/library/firebase/image';
import { generateQR } from '@/library/utils';

const NewAlbumPage: React.FC = () => {
  const [albumName, setAlbumName] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    alert(`Album "${albumName}" with ${images.length} images will be uploaded.`);
    const uploadRes = await uploadImageAlbum(albumName, previewUrls);
    setLoading(false)
    if (uploadRes) {
      const qrRes = await generateQR(`${window.location.hostname}/album/${uploadRes}`);
      console.log(qrRes)
      if (qrRes) setQrCode(qrRes);
      setAlbumId(uploadRes);
    }
  };
  console.log(qrCode)
  const Done = () => (
    <div>
      <Link href={`/album/${albumId}`}>View Album</Link>
      { qrCode && <Image width={200} height={200} src={qrCode} /> }
    </div>
  )

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {loading ? <CircularProgress /> :
          albumId !== null ? <Done /> : (
            <>
              <h1 className="text-2xl font-bold mb-4">Create New Album</h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-medium mb-1" htmlFor="albumName">
                    Album Name
                  </label>
                  <input
                    id="albumName"
                    type="text"
                    value={albumName}
                    onChange={handleAlbumNameChange}
                    required
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter album name"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1" htmlFor="images">
                    Upload Images
                  </label>
                  <input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFilesChange}
                    className="block"
                  />
                </div>
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {previewUrls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Create Album
                </button>
              </form>
            </>
          )
        }
      </main>
    </div>

  );
};

export default NewAlbumPage;