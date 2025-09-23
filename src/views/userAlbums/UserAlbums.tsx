'use client';

import React, { useState, useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import { getUserAlbums } from '@/library/firebase/image';

import UserDropdown from '@/components/ui/userDropdown';
import useUser from '@/components/hooks/useUser';
import Loading from '@/components/loading';

interface UserAlbumsProps {
  userId: string;
};

const UserAlbums: React.FC<UserAlbumsProps> = ({ userId }) => {
  const router = useRouter();
  const { user, userLoading } = useUser();

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
    if (!userLoading) {
      if (!user || user.uid !== userId) router.push('/');
      else if (user && user.uid === userId) {
        console.log('test2')
        fetchUserAlbums();
      }
    }
  }, [user, userLoading]);

  if (userLoading || loading) return <Loading />;
  return (
    <main className="max-w-4xl mx-auto">
      <div className="relative bg-primary pt-6  pl-5 pr-15 z-4">
        <h2 className="text-4xl text-secondary font-bold">Your Albums</h2>
        <h4 className="text-black mt-2 ml-2">{albums.length} albums</h4>
        <div className="absolute top-5 right-[5px] z-10">
          <UserDropdown variant="secondary" />
        </div>
      </div>
      <div className="h-[20px] w-full rotate-180 relative">
        <Image
          priority
          src="/tornEdge.png"
          alt="torn edge"
          fill
        />
      </div>
      <div className="flex flex-row flex-wrap gap-6 px-2 py-6 justify-center items-center">
        {albums.map((album, index) => (
          <Link key={`album-${index}`}href={`/album/${album.id}`} className="max-w-[150px] relative">
            <div className="bg-polaroid shadow-lg w-[150px] p-[5px] pb-[20px] relative z-3">
              <div className="h-[140px] w-[140px] relative">
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
            <h5 className="pt-2">{album.albumName}</h5>
            <p>{album.created}</p>
          </Link>
        ))}
      </div>
    </main>
  )
};

export default UserAlbums;