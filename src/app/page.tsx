'use client';

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation'; // For App Router


export default function Home() {
  const [showJoin, setShowJoin] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  const router = useRouter();


  const setToggleJoin = () => {
    if (!showJoin) setShowJoin(true);
    else if (roomCode.trim() !== "") {
      // Navigate to the album page with the room code
      router.push(`/album/${roomCode}`);
    }
  };
  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomCode(e.target.value);
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div>
          <h2 className="uppercase text-4xl font-extrabold mb-2 text-center sm:text-left">
            Pocket Photos
          </h2>
          <p>Share your most intimate moments with PP!</p>
        </div>
        <div className="flex flex-col gap-4">
          <Link href="/new-album">
            <Button variant="contained" color="primary">
              Host
            </Button>
          </Link>
          <div className="flex flex-row transition duration-300">
            <div className={`${showJoin ? 'expanded' : ''} expandable`}>
              <input
                type="text"
                value={roomCode}
                onChange={handleRoomCodeChange}
                placeholder="Enter Code"
                className="border border-gray-300 rounded px-2"
              />

            </div>
            <button
              onClick={setToggleJoin}
              color="primary"
              className={`
                px-2
                ${showJoin ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-gradient-x color-white' : ''}
              `}
            >
              {showJoin ? 'Join Room' : 'Join Room'}
            </button>
          </div>

        </div>

      </main>

    </div>
  );
}
