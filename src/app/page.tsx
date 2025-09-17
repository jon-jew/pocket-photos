'use client';

import { useState } from "react";

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
      <main className="flex flex-col rounded-md gap-[32px] row-start-2 items-center sm:items-start
      bg-gradient-to-br from-purple-500/30 via-pink-400/20 to-red-400/30 backdrop-blur-md p-8">
        <div>
          <h2 className="text-4xl font-extrabold mb-2 text-center sm:text-left">
            pluur.io
          </h2>
          <p>photo, lobby, upload, update, repost</p>
        </div>
        <div className="flex flex-col gap-4">
          <Link href="/new-album">
            <Button variant="contained" color="primary">
              Host
            </Button>
          </Link>
          <div className="flex flex-row h-10">
            <input
              type="text"
              value={roomCode}
              onChange={handleRoomCodeChange}
              placeholder="Enter Lobby Code"
              className="border border-gray-300 rounded-l px-2"
            />
            <button
              onClick={setToggleJoin}
              color="primary"
              className='rounded-r px-3 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-gradient-x color-white'
            >
              Join
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
