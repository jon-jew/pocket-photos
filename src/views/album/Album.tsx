'use client';

import React, { useState, useEffect, useRef } from "react";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

import { toast } from "react-toastify";
import clx from 'classnames';

import Modal from '@mui/material/Modal';

import QrCodeIcon from '@mui/icons-material/QrCode';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import SaveIcon from '@mui/icons-material/Save';
import TuneIcon from '@mui/icons-material/Tune';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

import { generateQR, compressFile, getAlbumHoursRemaining } from '@/library/utils';
import { getAlbumImages, editAlbumImages, uploadImagesToAlbum } from "@/library/firebase/image";
import { setJoinedAlbums } from "@/library/firebase/userClient";

import Loading from "@/components/loading";
import ImageGallery from "@/components/imageGallery";
import OptionsForm from "@/components/optionsForm";
import UserDropdown from "@/components/ui/userDropdown";
import ReportDropdown from "@/components/ui/reportDropdown";
import IconButton from "@/components/ui/iconButton";
import Button from "@/components/ui/button";

interface AlbumInfo {
  albumName: string;
  createdOn: number;
  dateString: string;
  ownerId: string;
  viewersCanEdit: boolean;
};

interface AlbumProps {
  albumId: string;
  initialAlbumInfo: AlbumInfo;
  initialImages: GalleryImageEntry[];
  initialJoined: boolean;
  currentUser: UserInfo | undefined;
}

export default function AlbumPage({
  albumId,
  initialAlbumInfo,
  initialImages,
  initialJoined,
  currentUser,
}: AlbumProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isScanned = searchParams.get('scanned') === 'true';
  const fromWaitlist = searchParams.get('waitlist') === 'true';

  const initialHoursRemaining = getAlbumHoursRemaining(initialAlbumInfo.createdOn);

  const [loading, setLoading] = useState<boolean>(true);

  const [imageList, setImageList] = useState<GalleryImageEntry[]>(initialImages || []);
  const [albumInfo, setAlbumInfo] = useState<AlbumInfo | undefined>(initialAlbumInfo);
  const [joined, setJoined] = useState<boolean>(initialJoined);

  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const [hoursRemaining, setHoursRemaining] = useState<number>(initialHoursRemaining);

  const [editMode, setEditMode] = useState<boolean>(false);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(-1);
  const [editedImageList, setEditedImageList] = useState<GalleryImageEntry[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

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
      setImageList(imageRes.imageList);
      setAlbumInfo({
        albumName: imageRes.albumName,
        ownerId: imageRes.ownerId,
        createdOn: imageRes.createdOn,
        dateString: imageRes.dateString,
        viewersCanEdit: imageRes.viewersCanEdit,
      });
      setLoading(false);
    } else {
      toast.error('Album not found');
      router.push('/');
    }
  };

  const handleToggleEditMode = () => {
    if (editMode) {
      setEditMode(false);
      setEditedImageList([]);
      setIsChanged(false);
    } else {
      setDeletedImageIds([]);
      setEditMode(true);
      setIsChanged(false);
      setIsQrOpen(false);
      setEditedImageList(imageList);
    }
  };

  const closeOptions = async (reload: boolean, loading: boolean) => {
    setLoading(loading);
    if (reload) await getImages();
    setIsOptionsOpen(false);
  };

  const handleRemoveImage = (idx: number) => {
    if (!isChanged) setIsChanged(true);
    setDeletedImageIds((prev) => [...prev, editedImageList[idx].id]);
    setEditedImageList((prev) => prev.filter((item, index) => index !== idx));
  };

  const handleReorderImage = (idx: number, direction: -1 | 1) => {
    if (!isChanged) setIsChanged(true);
    const newImageList = [...editedImageList];
    [newImageList[idx + direction], newImageList[idx]] = [newImageList[idx], newImageList[idx + direction]];

    setEditedImageList(newImageList);
  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isChanged) setIsChanged(true);
    setLoading(true);
    const files = Array.from(e.target.files || []);
    if (files.length + imageList.length > 75) {
      toast.error('Image count limit is 75.');
    } else {
      const newImages = await Promise.all(files.map((file) => compressFile(file, false)));

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
    await editAlbumImages(albumId, currentUser?.uid, editedImageList, deletedImageIds);
    await getImages();
    toast.success('Saved changes!');
    setEditMode(false);
  };

  const handleJoinClick = async () => {
    if (currentUser?.uid) {
      await setJoinedAlbums(albumId, currentUser?.uid, joined);
      setJoined(!joined);
    }
  }

  const getQrCode = async () => {
    const qrLink = window.location.host + window.location.pathname + '?scanned=true';
    const qrRes = await generateQR(qrLink);
    if (qrRes) setQrCode(qrRes);
  };

  useEffect(() => {
    getQrCode();
    if (initialHoursRemaining < 0) {
      router.push('/');
      toast.error('This lobby has expired!');
    }
    if (isScanned && currentUser) {
      setJoinedAlbums(albumId, currentUser?.uid, false);
    }
    if (fromWaitlist) {
      toast.success('Thank you for signing up!');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const checkAlbumExpiry = () => {
      const newHoursRemaining = getAlbumHoursRemaining(initialAlbumInfo.createdOn);
      if (newHoursRemaining < 0) {
        toast.error('This lobby has expired!');
        // router.push('/');
      } else {
        setHoursRemaining(newHoursRemaining);
      }
    };
    const intervalId = setInterval(checkAlbumExpiry, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (!albumInfo || loading) {
    return (
      <Loading progress={uploadProgress} />
    );
  }

  return (
    <>
      <main className="max-w-4xl mx-auto">
        <nav className="sticky w-full max-w-4xl z-[30] transition-[height] duration-200 ease-in-out">
          <div className="w-full bg-primary">
            <div className="pt-6 px-5">
              <div className="flex flex-row items-center mb-3 pr-10">
                <Image
                  priority
                  alt="Plurr Logo"
                  className="mr-2"
                  width={45}
                  height={44}
                  src="/logo-secondary.svg"
                />
                <h2 className="text-2xl text-secondary font-bold break-all text-ellipsis line-clamp-2">
                  {albumInfo.albumName}
                </h2>
              </div>
              <div className="flex flex-row">
                <p className="pl-3 text-md text-black">{albumInfo.dateString}</p>
                <div className="flex gap-4 grow justify-end">
                  {currentUser &&
                    <IconButton onClick={handleJoinClick}>
                      {joined ?
                        <BookmarkIcon color="warning" /> :
                        <BookmarkBorderIcon />
                      }
                    </IconButton>
                  }
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
            <UserDropdown
              user={currentUser}
              variant="secondary"
              prevAlbumId={albumId}
            />
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
        <div className="pt-3 px-2 pb-[50px]">
          <div className="flex flex-row gap-3 pl-3 pr-2 my-2">
            <ReportDropdown albumId={albumId} />
            <h4 className="text-primary">
              {imageList.length} <ImageIcon sx={{ fontSize: '16px' }} />
            </h4>
            <div className="flex justify-end items-center grow text-xs">
              {hoursRemaining} H Remaining
            </div>
          </div>
          {imageList.length === 0 ?
            <div className="flex flex-col justify-center items-center p-4 gap-4 h-[calc(100vh-200px)]">
              <h3>Add images to start the fun!</h3>
              <Button variant="secondary" fullWidth>
                <label htmlFor="image-upload">
                  + Add images
                </label>
              </Button>
            </div> :
            <ImageGallery
              currentUserId={currentUser?.uid}
              imageList={editMode ? editedImageList : imageList}
              initialReactions={imageList.map((image) => ({
                selectedReaction: currentUser?.uid ?
                  image.reactions?.find((reaction) => reaction.userId === currentUser.uid)?.reaction : null,
                reactionString: image.reactions ? `${image.reactionString} ${image.reactions?.length}` : '',
              }))}
              albumId={albumId}
              editMode={albumInfo.ownerId === currentUser?.uid ? editMode : false}
              showDownload
              onModalOpen={() => setIsQrOpen(false)}
              handleRemoveImage={handleRemoveImage}
              handleReorderImage={handleReorderImage}
            />
          }
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
