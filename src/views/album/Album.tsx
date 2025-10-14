'use client';

import React, { useState, useEffect, useRef } from "react";

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { toast } from "react-toastify";
import clx from 'classnames';

import Modal from '@mui/material/Modal';

import QrCodeIcon from '@mui/icons-material/QrCode';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import SaveIcon from '@mui/icons-material/Save';
import TuneIcon from '@mui/icons-material/Tune';
import ShareIcon from '@mui/icons-material/Share';

import { generateQR, compressFile } from '@/library/utils';
import { getAlbumImages, editAlbumImages, uploadImagesToAlbum } from "@/library/firebase/image";

import Loading from "@/components/loading";
import ImageGallery from "@/components/imageGallery";
import OptionsForm from "@/components/optionsForm";
import UserDropdown from "@/components/ui/userDropdown";
import ReportDropdown from "@/components/ui/reportDropdown";
import IconButton from "@/components/ui/iconButton";

interface AlbumInfo {
  albumName: string;
  created: string;
  ownerId: string;
  viewersCanEdit: boolean;
};

interface AlbumProps {
  albumId: string;
  initialAlbumInfo: AlbumInfo;
  initialImages: ImageEntry[];
  currentUser: UserInfo | undefined;
}

export default function AlbumPage({
  albumId,
  initialAlbumInfo,
  initialImages,
  currentUser,
}: AlbumProps) {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);

  const [images, setImages] = useState<ImageEntry[]>(initialImages || []);
  const [albumInfo, setAlbumInfo] = useState<AlbumInfo | undefined>(initialAlbumInfo);

  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(-1);
  const [imageChanges, setImageChanges] = useState<ImageChange[]>([]);
  const [deletedImages, setDeletedImages] = useState<ImageChange[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQr = () => {
    setIsQrOpen(!isQrOpen);
  };

  async function shareContent() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Plurr: ${albumInfo?.albumName}`,
          text: 'Check out this image lobby!',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing content:', error);
      }
    } else {
      console.log('Web Share API not supported in this browser.');
    }
  }

  const getImages = async () => {
    const imageRes = await getAlbumImages(albumId);
    if (imageRes) {
      setImages(imageRes.imageList);
      setAlbumInfo({
        albumName: imageRes.albumName,
        ownerId: imageRes.ownerId,
        created: imageRes.createdOn,
        viewersCanEdit: imageRes.viewersCanEdit,
      })
      setLoading(false);
    } else {
      toast.error('Album not found');
      router.push('/');
    }
  };

  const handleToggleEditMode = () => {
    if (editMode) {
      setEditMode(false);
      setImageChanges([]);
      setIsChanged(false);
    } else {
      setDeletedImages([]);
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

  const closeOptions = async (reload: boolean, loading: boolean) => {
    if (loading) setLoading(true);
    if (reload) await getImages();
    setIsOptionsOpen(false);
  };

  const handleRemoveImage = (idx: number) => {
    if (!isChanged) setIsChanged(true);
    if (imageChanges[idx].uploaded) {
      setDeletedImages((prev) => [...prev, imageChanges[idx]]);
    }
    setImageChanges((prev) => prev.filter((item, index) => index !== idx));
  };

  const handleReorderImage = (idx: number, direction: -1 | 1) => {
    if (!isChanged) setIsChanged(true);
    const newImageChanges = [...imageChanges];
    [newImageChanges[idx + direction], newImageChanges[idx]] = [newImageChanges[idx], newImageChanges[idx + direction]];
    newImageChanges[idx + direction].change = 'moved';
    newImageChanges[idx].change = 'moved';
    setImageChanges(newImageChanges);
  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isChanged) setIsChanged(true);
    setLoading(true);
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 75) {
      toast.error('Image count limit is 75.');
    } else {
      const newImages = await Promise.all(files.map(compressFile));

      await uploadImagesToAlbum(
        albumId,
        newImages.map((image) => image.file),
        currentUser,
        setUploadProgress,
      );
      await getImages();
      toast.success(`Added ${files.length} images`);
    }
    setLoading(false);
  };

  const handleSubmitChanges = async () => {
    setLoading(true);
    await editAlbumImages(albumId, currentUser?.uid, imageChanges, deletedImages);
    await getImages();
    toast.success('Saved changes!');
    setEditMode(false);
  };

  const getQrCode = async () => {
    const qrRes = await generateQR(window.location.href);
    if (qrRes) setQrCode(qrRes);
  };

  useEffect(() => {
    getQrCode();
    // getImages();
  }, []);

  if (!albumInfo || loading) {
    return (
      <Loading progress={uploadProgress} />
    );
  }
  if (images.length === 0) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">{albumInfo.albumName || 'Missing Album Name'}</h1>
        <p>No images in album</p>
      </main>
    );
  };

  return (
    <>
      <main className="max-w-4xl mx-auto">
        <nav className="fixed w-full max-w-4xl z-[30] transition-[height] duration-200 ease-in-out">
          <div className="w-full bg-primary">
            <div className="pt-6 pl-5 pr-17">
              <h2 className="text-2xl text-secondary font-bold mb-2">{albumInfo.albumName}</h2>
              <div className="flex flex-row">
                <p className="pl-3 text-md text-black">{albumInfo.created}</p>
                <div className="flex gap-4 grow justify-end">
                  <IconButton onClick={shareContent}>
                    <ShareIcon />
                  </IconButton>
                  <IconButton
                    chevronState={isQrOpen ? 'up' : 'down'}
                    onClick={handleQr}
                  >
                    <QrCodeIcon />
                  </IconButton>

                </div>
              </div>
            </div>
            <div className={clx({
              "h-0": !isQrOpen,
              "h-[225px]": isQrOpen,
              "w-full transition-[height] bg-primary duration-200 ease-in-out overflow-hidden gap-2 flex flex-col items-center justify-center": true,
            })}>
              <div className="text-center bg-white rounded-lg overflow-hidden">
                {qrCode && <Image alt="QR code" width={160} height={160} src={qrCode} />}
                <p className="pb-2 !text-md text-black">{albumId}</p>
              </div>
            </div>
            <UserDropdown initialUser={currentUser} variant="secondary" />
          </div>
          <div className="h-[20px] w-full rotate-180 relative">
            <Image
              priority
              src="/tornEdge.png"
              alt="torn edge"
              fill
            />
          </div>
        </nav>
        <div className="pt-30 px-2 pb-[50px]">
          <div className="flex flex-row gap-3 pl-3">
            <ReportDropdown albumId={albumId} />
            <h4 className="text-primary">
              {images.length} images
            </h4>
          </div>
          <ImageGallery
            images={editMode ?
              imageChanges.map((imageChange) => imageChange.imageUrl) :
              images.map((image) => image.imageUrl)
            }
            onModalOpen={() => setIsQrOpen(false)}
            handleRemoveImage={handleRemoveImage}
            handleReorderImage={handleReorderImage}
            editMode={albumInfo.ownerId === currentUser?.uid ? editMode : false}
            showDownload={true}
            variant="secondary"
          />
        </div>

        <div className="fixed w-full max-w-4xl pb-5 bottom-0 z-10">
          <div className="text-secondary h-[50px] flex flex-row items-center justify-center gap-20 pb-4">
            {editMode &&

              <button
                className="text-secondary ring-blue-500/50 shadow-xl bg-primary text-[14px] px-4 py-2 rounded-lg"
                onClick={handleSubmitChanges}
                disabled={!isChanged}
                type="button"
              >
                Save <SaveIcon sx={{ fontSize: '18px' }} />
              </button>
            }
            {!editMode &&
              <>
                <button type="button" className="bg-primary ring-blue-500/50 shadow-xl px-2 py-3 rounded-[50%]">
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
            {(currentUser?.uid === albumInfo.ownerId) &&
              <button
                className={`bg-primary ring-blue-500/50 shadow-xl px-${editMode ? '2' : '3'} py-3 rounded-[50%]`}
                type="button"
                onClick={handleToggleEditMode}
              >
                {editMode && <span className="text-xs">x</span>}<EditIcon />
              </button>
            }
            {(currentUser?.uid === albumInfo.ownerId && !editMode) &&
              <button
                className="bg-primary  ring-blue-500/50 shadow-xl px-3 py-3 rounded-[50%]"
                type="button"
                onClick={() => setIsOptionsOpen(true)}
              >
                <TuneIcon />
              </button>
            }
          </div>
        </div>
      </main>
      <Modal open={isOptionsOpen} onClose={() => closeOptions(false, false)}>
        <div
          className="fixed inset-0 flex items-center justify-center z-[1000]"
        >
          <button
            onClick={() => closeOptions(false, false)}
            type="button"
            className="close-btn absolute top-8 left-8 text-2xl"
          >
            X
          </button>
          <div
            className="fixed w-full h-full z-[999]"
            onClick={() => closeOptions(false, false)}
          />
          <OptionsForm
            albumId={albumId}
            currentUser={currentUser}
            initialAlbumName={albumInfo.albumName}
            initialViewersCanEdit={albumInfo.viewersCanEdit}
            closeOptions={closeOptions}
          />
        </div>
      </Modal>
    </>
  );
};
