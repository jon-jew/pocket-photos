'use client';

import React, { useState, useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { User } from "firebase/auth";

import CollectionsIcon from '@mui/icons-material/Collections';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';

import { getAlbumHoursRemaining } from '@/library/utils';

import IconButton from '@/components/ui/iconButton';
import Button from '@/components/ui/button';
import UserDropdown from '@/components/ui/userDropdown';

import './albumGallery.scss';

const POLAROID_SIZE = 140;
const containerSize = POLAROID_SIZE.toString();
const imageSize = (POLAROID_SIZE - 10).toString();

interface AlbumGalleryProps {
  title: string;
  currentUser: User;
  path: string;
  initialAlbumList: UserAlbum[];
  showNewAlbumBtn?: boolean;
};

const AlbumGallery: React.FC<AlbumGalleryProps> = ({
  title,
  currentUser,
  path,
  initialAlbumList,
  showNewAlbumBtn = false,
}) => {
  const [albums, setAlbums] = useState<UserAlbum[]>(initialAlbumList);
  useEffect(() => {
    // Update hours remaining for albums every 1 minute
    const checkAlbumExpiry = () => {
      const newAlbums = albums.map((album) => ({
        ...album,
        hoursRemaining: getAlbumHoursRemaining(album.createdOn),
      }));
      setAlbums(newAlbums);
    };
    const intervalId = setInterval(checkAlbumExpiry, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <main className="max-w-4xl mx-auto min-h-screen">
      <nav className="sticky top-0 w-full max-w-4xl z-[30]">
        <div className="relative bg-primary pt-6 pl-5 pr-8 z-4 flex flex-col gap-3">
          <div className="flex flex-row items-center">
            <Image
              priority
              alt="Plurr Logo"
              className="mr-2"
              width={45}
              height={44}
              src="/logo-secondary.svg"
            />
            <h2 className="text-2xl text-secondary font-bold">{title}</h2>
          </div>
          <div className="flex pl-2 w-full items-center">
            <h4 className="text-secondary opacity-70">
              {albums.length}
              <CollectionsIcon sx={{ marginLeft: '4px', fontSize: '16px' }} />
            </h4>
            {showNewAlbumBtn &&
              <div className="grow flex justify-end">
                <Link href="/new-lobby">
                  <IconButton>
                    <span className="text-md">+</span><CollectionsIcon />
                  </IconButton>
                </Link>
              </div>
            }
          </div>
          <UserDropdown variant="secondary" user={currentUser} currentPath={path} />
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
      {albums.length > 0 ?
        <div className="flex flex-row flex-wrap gap-x-10 gap-y-12 px-4 py-10 justify-center items-start content-start min-h-[calc(100vh-240px)]">
          {albums.map((album, index) => (
            <Link
              key={`album-${index}`}
              href={`/lobby/${album.id}`}
              className="max-w-[150px] relative"
            >
              {album.hoursRemaining >= 0 ?
                <div className="absolute -top-3 -right-3 z-[20] text-xs bg-secondary text-primary border-1 border-primary px-2 py-1 rounded-lg">
                  {album.hoursRemaining > 21 ? <HourglassTopIcon sx={{ fontSize: 16 }} /> : <HourglassBottomIcon sx={{ fontSize: 16 }} />}
                  <span className="ml-1">{album.hoursRemaining} H</span>
                </div> :
                <div className="absolute -top-3 -right-3 z-[20] text-xs bg-warning text-white border-1 border-white px-2 py-1 rounded-lg">
                  Expired
                </div>
              }
              <div className="shadow-lg polaroid-container top shadow-lg">
                <div className="polaroid-image">
                  {album.thumbnailImage ?
                    <Image
                      src={album.thumbnailImage}
                      fill
                      alt={`Album Thumbnail ${index}`}
                      style={{ objectFit: 'cover' }}
                    /> :
                    <>
                      <ImageNotSupportedIcon />
                      <p>Empty</p>
                    </>
                  }
                </div>
              </div>
              <div className="polaroid-container absolute top-0 z-2 rotate-5 -translate-y-2">
                <div className={`polaroid-image !bg-black`} />
              </div>
              <div className={`polaroid-container absolute top-0 z-2 -rotate-6 -translate-x-2 -translate-y-1`}>
                <div className={`polaroid-image !bg-black`} />
              </div>
              <div className="absolute bottom-[-5px] left-[-20px] z-[20] px-3 py-2 bg-primary shadow-lg rounded-full">
                <h5 className="text-xs text-secondary break-all text-ellipsis line-clamp-2">
                  {album.albumName}
                </h5>
              </div>
            </Link>
          ))}
        </div> :
        <div className="flex flex-col h-[calc(100vh-150px)] justify-center items-center text-center">
          {path === '/joined-lobbies' &&
            <>
              <h5 className="text-primary !text-xl mb-6">
                Your have no joined lobbies!
              </h5>
              <p className="!text-sm">
                Either scan the lobby QR code<br />
                <small>or</small><br />
                visit the lobby and bookmark it<br />
                to add them to this list!
              </p>
            </>
          }
          {path === '/my-lobbies' &&
            <>
              <h5 className="text-primary !text-xl mb-6">
                Your have no lobbies!
              </h5>
              <Button variant="secondary" href="/new-lobby">
                +<CollectionsIcon sx={{ mr: 1 }}/> Create Lobby
              </Button>
            </>
          }
        </div>
      }
    </main>
  )
};

export default AlbumGallery;
