'use client';

import { useRouter } from 'next/navigation'; // For App Router

import DialpadIcon from '@mui/icons-material/Dialpad';

import IconHeader from "@/components/iconHeader";
import TornContainer from "@/components/tornContainer/TornContainer";
import Button from "@/components/ui/button";
import Textfield from "@/components/ui/textfield";

export default function Home() {
  const router = useRouter();

  const handleJoinClick = (value: string) => {
    if (value.trim() !== "") {
      // Navigate to the album page with the room code
      router.push(`/album/${value}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <IconHeader />
      <TornContainer>
        <h3 className="mb-2">
          Got a code from a friend?<br />
          Paste it here to join the fun!
        </h3>
        <Textfield
          label="Enter Lobby Code"
          buttonLabel="Join"
          fullWidth
          onButtonClick={handleJoinClick}
          LeadingIcon={<DialpadIcon sx={{ fontSize: '18px' }} />}
        />
        <span className="mt-4">or</span>
        <h3>Want to create a new lobby?</h3>
        <Button href="/new-album" variant="primary" fullWidth>
          Host Lobby
        </Button>
      </TornContainer>
    </div>
  );
}
