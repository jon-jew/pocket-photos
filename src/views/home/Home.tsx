'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { toast } from 'react-toastify';

import DialpadIcon from '@mui/icons-material/Dialpad';

import IconHeader from "@/components/iconHeader";
import TornContainer from "@/components/tornContainer/TornContainer";
import Button from "@/components/ui/button";
import Textfield from "@/components/ui/textfield";

export default function Home({ currentUser }: { currentUser: User | undefined }) {
  const [lobbyCode, setLobbyCode] = useState<string>('');
  const router = useRouter();


  const handleJoinClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (lobbyCode.trim() !== "") {
      // Navigate to the album page with the room code
      router.push(`/album/${lobbyCode}`);
    }
  };

  const handleLobbyClick = () => {
    if (currentUser) {
      router.push('/new-album');
    } else {
      toast.info('Please login to create a lobby');
      router.push('/login');
    }
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <IconHeader showLogin currentUser={currentUser} />
      <TornContainer>
        <h3 className="mb-2">
          Got a code from a friend?<br />
          Paste it here to join the fun!
        </h3>
        <form className="flex items-center justify-center w-full" onSubmit={handleJoinClick}>
          <Textfield
            label="Enter Lobby Code"
            onChange={(e) => setLobbyCode(e.target.value)}
            fullWidth
            buttonLabel="Join"
            buttonType="submit"
            LeadingIcon={<DialpadIcon sx={{ fontSize: '18px' }} />}
          />
        </form>
        <span className="mt-4">or</span>
        <h3>Want to create a new lobby?</h3>
        <Button onClick={handleLobbyClick} variant="primary" fullWidth>
          Host Lobby
        </Button>
      </TornContainer>
    </div>
  );
}
