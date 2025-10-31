'use client';

import React, { useState, useEffect, useRef } from "react";

import Image from 'next/image';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

import { toast } from "react-toastify";
import clx from 'classnames';
// import { logEvent } from 'firebase/analytics';

import Snackbar from '@mui/material/Snackbar';
import Slide from '@mui/material/Slide';
import Modal from '@mui/material/Modal';

import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import QrCodeIcon from '@mui/icons-material/QrCode';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import TuneIcon from '@mui/icons-material/Tune';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

import {
  generateQR,
  compressFile,
  getTimeDifference,
  getAlbumHoursRemaining,
  getAlbumDaysRemaining,
} from '@/library/utils';
import { getAlbumImages, editAlbumImages, uploadImagesToAlbum, } from "@/library/firebase/imageClient";
import { setJoinedAlbums } from "@/library/firebase/userClient";
// import { analytics } from "@/library/firebase/clientApp";

import useUserSession from "@/components/hooks/useUserSesssion";

import Loading from "@/components/loading";
import Navbar from "@/components/ui/navbar";
import ImageGallery from "@/components/imageGallery";
import OptionsForm from "@/components/optionsForm";
import ReportDropdown from "@/components/ui/reportDropdown";
import IconButton from "@/components/ui/iconButton";
import Button from "@/components/ui/button";

interface AlbumInfo extends AlbumEntry {
  viewersCanEdit: boolean;
}

interface AlbumProps {
  albumId: string;
  initialAlbumInfo: AlbumInfo;
  initialImages: GalleryImageEntry[];
  initialJoined: boolean;
  initialUser: UserInfo | undefined;
}

export default function AlbumPage({
  albumId,
  initialAlbumInfo,
  initialImages,
  initialJoined,
  initialUser,
}: AlbumProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUserSession(initialUser);

  const isScanned = searchParams.get('scanned') === 'true';
  const fromWaitlist = searchParams.get('waitlist') === 'true';

  const [loading, setLoading] = useState<boolean>(true);

  const [imageList, setImageList] = useState<GalleryImageEntry[]>(initialImages || []);
  const [albumInfo, setAlbumInfo] = useState<AlbumInfo>(initialAlbumInfo);
  const [joined, setJoined] = useState<boolean>(initialJoined);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const [waitlistMsgOpen, setWaitlistMsgOpen] = useState<boolean>(false);

  const [editMode, setEditMode] = useState<boolean>(false);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [editedImageList, setEditedImageList] = useState<GalleryImageEntry[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(-1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const handleQr = () => {
    setIsQrOpen(!isQrOpen);
  };
  const handleWaitlistClose = () => {
    setWaitlistMsgOpen(false);
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
        firstUploadOn: imageRes.firstUploadOn,
        id: albumId,
        ownerId: imageRes.ownerId,
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
    setUploadProgress(0);
    setLoading(true);
    const files = Array.from(e.target.files || []);
    if (files.length + imageList.length > 75) {
      toast.error('Image count limit is 75.');
    } else {
      const newImages = await Promise.all(files.map((file) => compressFile(file, false)));

      await uploadImagesToAlbum(
        albumId,
        newImages.map((image) => image.file),
        user,
        setUploadProgress,
      );
      await getImages();
      toast.success(`Added ${files.length} images`);
    }
    setLoading(false);
    setUploadProgress(0);
  };

  const handleSubmitChanges = async () => {
    setLoading(true);
    await editAlbumImages(albumId, user?.uid, editedImageList, deletedImageIds);
    await getImages();
    toast.success('Saved changes!');
    setEditMode(false);
  };

  const handleJoinClick = async () => {
    if (user?.uid) {
      await setJoinedAlbums(albumId, user?.uid, joined);
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
    if (getAlbumDaysRemaining(Date.now(), albumInfo.firstUploadOn) < 0 && albumInfo.firstUploadOn !== null) {
      router.push('/');
      toast.error('This lobby has expired!');
    }
    if (isScanned && user) {
      setJoinedAlbums(albumId, user?.uid, false);
      setJoined(true);
      // logEvent(analytics, 'scanned_code', {
      //   is_logged_in: true,
      //   lobby_id: albumId,
      // });
    } else if (isScanned) {
      // logEvent(analytics, 'scanned_code', {
      //   is_logged_in: false,
      //   lobby_id: albumId,
      // });
    }
    if (fromWaitlist) {
      toast.success('Thank you for signing up!');
    }
    setLoading(false);
    timeoutRef.current = setTimeout(() => {
      setWaitlistMsgOpen(true);
    }, 1000);
  }, []);

  useEffect(() => {
    const checkAlbumExpiry = () => {
      const newDaysRemaining = getAlbumDaysRemaining(Date.now(), initialAlbumInfo.firstUploadOn);
      if (newDaysRemaining < 0 && albumInfo.firstUploadOn !== null) {
        toast.error('This lobby has expired!');
        router.push('/');
      } else {
        setCurrentTime(Date.now());
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

  const hoursRemaining = getAlbumHoursRemaining(currentTime, albumInfo.firstUploadOn);
  const daysRemaining = getAlbumDaysRemaining(currentTime, albumInfo.firstUploadOn);

  return (
    <>
      <div className="max-w-4xl mx-auto relative">
        <Navbar
          user={user}
          title={
            <h2 className="text-2xl text-secondary font-bold break-all text-ellipsis line-clamp-2">
              {albumInfo.ownerId === user?.uid && <PersonIcon sx={{ fontSize: 20, mr: 1 }} />}
              {hoursRemaining < 0 && <LockIcon sx={{ fontSize: 20, mr: 1 }} />}
              {albumInfo.albumName}
            </h2>
          }
        >
          <div className="flex flex-row mt-2 items-end">
            <p className="pl-3 text-md text-black opacity-80">
              {albumInfo.firstUploadOn !== null ?
                getTimeDifference(albumInfo.firstUploadOn, false) : 'New Lobby'
              }
            </p>
            <div className="flex gap-4 grow justify-end">
              {user &&
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
        </Navbar>
        <main className="pt-3 px-2 pb-[50px]">
          <div className="flex flex-row gap-3 pl-3 pr-2 my-2">
            <ReportDropdown albumId={albumId} />
            <h4 className="text-primary">
              {imageList.length} <ImageIcon sx={{ fontSize: '16px' }} />
            </h4>
            {albumInfo.firstUploadOn !== null &&
              <div className="flex justify-end content-center grow gap-2 text-xs">
                {hoursRemaining >= 0 ?
                  <>
                    <p>{hoursRemaining} H Until</p>
                    <LockIcon sx={{ fontSize: 14 }} />
                  </> :
                  <>
                    <p>{daysRemaining} D Until</p>
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </>
                }
              </div>
            }
          </div>
          {imageList.length === 0 ?
            <div className="flex flex-col justify-center items-center p-4 gap-4 h-[calc(100vh-260px)]">
              <h3>Add images to start the fun!</h3>
              <Button variant="secondary" fullWidth>
                <label htmlFor="image-upload-empty">
                  + Add images
                </label>
                <input
                  id="image-upload-empty"
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFilesChange}
                  className="hidden"
                />
              </Button>
            </div> :
            <ImageGallery
              userId={user?.uid}
              imageList={editMode ? editedImageList : imageList}
              initialReactions={imageList.map((image) => ({
                selectedReaction: user?.uid ?
                  image.reactions?.find((reaction) => reaction.userId === user.uid)?.reaction : null,
                reactionString: image.reactions ? `${image.reactionString} ${image.reactions?.length}` : '',
              }))}
              albumId={albumId}
              editMode={albumInfo.ownerId === user?.uid ? editMode : false}
              showDownload
              onModalOpen={() => setIsQrOpen(false)}
              handleRemoveImage={handleRemoveImage}
              handleReorderImage={handleReorderImage}
            />
          }
        </main>

        <footer className="fixed w-full max-w-4xl pb-5 bottom-0 z-10">
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
            {!editMode && hoursRemaining >= 0 &&
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
            {(user?.uid === albumInfo.ownerId && hoursRemaining >= 0) &&
              <button
                className={`bg-primary ring-blue-500/50 shadow-xl px-${editMode ? '2' : '3'} py-3 rounded-[50%]`}
                type="button"
                onClick={handleToggleEditMode}
              >
                {editMode && <span className="text-xs">x</span>}<EditIcon />
              </button>
            }
            {(user?.uid === albumInfo.ownerId && !editMode) &&
              <button
                className="bg-primary  ring-blue-500/50 shadow-xl px-3 py-3 rounded-[50%]"
                type="button"
                onClick={() => setIsOptionsOpen(true)}
              >
                <TuneIcon />
              </button>
            }
          </div>
        </footer>
      </div>
      <Snackbar
        key="waitlist-snack"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={waitlistMsgOpen}
        sx={{ pointerEvents: 'none' }}
        // autoHideDuration={5000}
        slots={{ transition: Slide }}
        onClose={handleWaitlistClose}
      >
        <div className="flex flex-row items-center justify-center mb-20 pointer-events-auto px-6 py-4 bg-gray-900">
          <p className="text-xs">Wanna stay in the loop?</p>
          <Link href={`/waitlist?prevAlbumId=${albumId}`}>
            <button type="button" className="text-sm text-primary underline ml-3 mr-5">
              Join Waitlist
            </button>
          </Link>
          <IconButton onClick={handleWaitlistClose}>
            <CloseIcon sx={{ color: '#FFF', fontSize: 18 }} />
          </IconButton>
        </div>
      </Snackbar>
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
            user={user}
            initialAlbumName={albumInfo.albumName}
            initialViewersCanEdit={albumInfo.viewersCanEdit}
            closeOptions={closeOptions}
          />
        </div>
      </Modal>
    </>
  );
};
