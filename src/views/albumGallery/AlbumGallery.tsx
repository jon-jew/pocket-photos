'use client';

import React, { useState, useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { User } from "firebase/auth";
import clx from 'classnames';

import CollectionsIcon from '@mui/icons-material/Collections';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

import { getAlbumHoursRemaining } from '@/library/utils';

import QrScanner from '@/components/qrScanner';
import Button from '@/components/ui/button';
import Navbar from '@/components/ui/navbar';

import './albumGallery.scss';

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
  const [qrScannerOpen, setQrScannerOpen] = useState<boolean>(false);

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
    <div className="max-w-4xl mx-auto min-h-screen">
      <QrScanner isOpen={qrScannerOpen} setIsOpen={setQrScannerOpen} />
      <Navbar
        currentUser={currentUser}
        title={
          <>
            <h2 className="text-2xl text-secondary font-bold">{title}</h2>
            <h4 className="ml-2 text-secondary opacity-70">
              {'('}{albums.length}
              <CollectionsIcon sx={{ marginLeft: '4px', fontSize: '16px' }} />
              {')'}
            </h4>
          </>
        }
        path={path}
      />

      <main className={clx({
        'flex flex-col min-h-[calc(100vh-150px)] items-center text-center py-4': true,
        'justify-center': albums.length === 0,
      })}
      >
        {showNewAlbumBtn && albums.length !== 0 &&
          <Button href="/new-lobby" variant="outlinedSecondary">
            +<CollectionsIcon sx={{ mr: 1 }} /> Create New Lobby
          </Button>
        }
        {path === '/joined-lobbies' && albums.length !== 0 &&
          <Button onClick={() => setQrScannerOpen(true)} variant="outlinedSecondary">
            <QrCodeScannerIcon sx={{ mr: 1 }} /> Scan Code
          </Button>
        }
        {albums.length > 0 ?
          <div className="flex flex-row flex-wrap gap-x-10 gap-y-12 px-4 py-8 justify-center items-start content-start min-h-[calc(100vh-240px)]">
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
                  <h5 className="text-xs text-black break-all text-ellipsis line-clamp-2">
                    {album.albumName}
                  </h5>
                </div>
              </Link>
            ))}
          </div> :
          <>
            {path === '/joined-lobbies' &&
              <>
                <h5 className="text-primary !text-xl mb-6">
                  Your have no joined lobbies!
                </h5>
                <p className="!text-sm mb-4">
                  Either scan the lobby QR code
                </p>
                <Button onClick={() => setQrScannerOpen(true)} variant="outlinedSecondary">
                  <QrCodeScannerIcon sx={{ mr: 1 }} /> Scan Code
                </Button>
                <p className="mt-4 !text-xs">
                  or
                </p>
                <p className="mt-4 !text-sm">
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
                  +<CollectionsIcon sx={{ mr: 1 }} /> Create Lobby
                </Button>
              </>
            }
          </>
        }
      </main>
    </div >
  )
};

export default AlbumGallery;
