'use client';

import React, { useState, useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from "firebase/auth";
import { toast } from 'react-toastify';

import { getUserAlbums } from '@/library/firebase/image';

import UserDropdown from '@/components/ui/userDropdown';
import Loading from '@/components/loading';

interface UserAlbumsProps {
  userId: string;
  currentUser: User | undefined;
};

const UserAlbums: React.FC<UserAlbumsProps> = ({ userId, currentUser }) => {
  const router = useRouter();

  const [albums, setAlbums] = useState<UserAlbum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchUserAlbums = async () => {
    const albumsRes = await getUserAlbums(userId);
    if (albumsRes) {
      setAlbums(albumsRes.filter((album) => album !== undefined));
      setLoading(false);
    }
    else toast.error('Failed to get albums');
  };

  useEffect(() => {
    if (currentUser?.uid !== userId) router.push('/');
    else if (currentUser?.uid === userId) {
      fetchUserAlbums();
    }

  }, [currentUser]);

  if (loading) return <Loading />;
  return (
    <main className="max-w-4xl pt-22 mx-auto">
      <nav className="fixed top-0 w-full z-[30]">
        <div className="relative bg-primary pt-6 pl-5 pr-15 z-4">
          <h2 className="text-3xl text-secondary font-bold">Your Albums</h2>
          <UserDropdown variant="secondary" initialUser={currentUser} />
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
      <h4 className="text-primary mt-2 ml-10 mb-3">{albums.length} albums</h4>
      <div className="flex flex-row flex-wrap gap-x-10 gap-y-15 px-2 py-6 justify-center items-center">
        {albums.map((album, index) => (
          <Link key={`album-${index}`} href={`/album/${album.id}`} className="max-w-[150px] relative">
            <div className="bg-polaroid shadow-lg w-[150px] p-[5px] pb-[20px] relative z-3">
              <div className="h-[140px] w-[140px] relative bg-[#292929]">
                <Image
                  src={album.thumbnailImage}
                  fill
                  alt={`Album Thumbnail ${index}`}
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
            <div className="bg-polaroid shadow-lg w-[150px] p-[5px] pb-[20px] absolute top-0 z-2 rotate-5 -translate-y-2">
              <div className="h-[140px] w-[140px] bg-black" />
            </div>
            <div className="bg-polaroid shadow-lg w-[150px] p-[5px] pb-[20px] absolute top-0 z-2 -rotate-6 -translate-x-2 -translate-y-1">
              <div className="h-[140px] w-[140px] bg-black" />
            </div>
            <h5 className="absolute bottom-[-15px] left-[-20px] z-[20] px-3 py-2 bg-primary text-sm text-secondary rounded-full">
              {album.albumName}
            </h5>
            {/* <p>{album.created}</p> */}
          </Link>
        ))}
        <div className="fixed bottom-10 right-15 z-[25]">
          <Link href='/new-album'>
            <button className="bg-secondary text-primary border-4 border-primary text-3xl px-6 py-4 rounded-full">
              +
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
};

export default UserAlbums;