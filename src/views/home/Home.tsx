'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
// import { logEvent } from 'firebase/analytics';

import Snackbar from '@mui/material/Snackbar';
import Slide from '@mui/material/Slide';

import CloseIcon from '@mui/icons-material/Close';
import DialpadIcon from '@mui/icons-material/Dialpad';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

// import { analytics } from "@/library/firebase/clientApp";
import useUserSession from '@/components/hooks/useUserSesssion';

import QrScanner from '@/components/qrScanner';
import IconHeader from "@/components/iconHeader";
import IconButton from "@/components/ui/iconButton";
import TornContainer from "@/components/tornContainer/TornContainer";
import Button from "@/components/ui/button";
import Textfield from "@/components/ui/textfield";

export default function Home({ initialUser }: { initialUser: UserInfo | undefined }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUserSession(initialUser);

  const fromWaitlist = searchParams.get('waitlist') === 'true';

  const [lobbyCode, setLobbyCode] = useState<string>('');
  const [waitlistMsgOpen, setWaitlistMsgOpen] = useState<boolean>(false);
  const [qrScannerOpen, setQrScannerOpen] = useState<boolean>(false);

  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const handleWaitlistClose = () => {
    setWaitlistMsgOpen(false);
  };

  const handleJoinClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (lobbyCode.trim() !== "") {
      // logEvent(analytics, 'entered_code', {
      //   is_logged_in: user !== undefined,
      //   lobby_id: lobbyCode,
      // });
      // Navigate to the album page with the room code
      router.push(`/lobby/${lobbyCode}`);
    }
  };

  const handleLobbyClick = () => {
    if (user) {
      router.push('/new-lobby');
    } else {
      toast.info('Please login to create a lobby');
      router.push('/login');
    }
  }

  useEffect(() => {
    if (fromWaitlist) {
      toast.success('Thank you for signing up!');
    }
    timeoutRef.current = setTimeout(() => {
      setWaitlistMsgOpen(true);
    }, 1000);
  }, []);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <QrScanner isOpen={qrScannerOpen} setIsOpen={setQrScannerOpen} />
      <IconHeader showLogin user={user} />
      <TornContainer>
        <h3 className="mb-2">
          Got a code from a friend?<br />
          Paste or scan it to join the fun!
        </h3>
        <form className="flex items-center justify-center w-full mb-2" onSubmit={handleJoinClick}>
          <Textfield
            label="Enter Lobby Code"
            onChange={(e) => setLobbyCode(e.target.value)}
            fullWidth
            buttonLabel="Join"
            buttonType="submit"
            LeadingIcon={<DialpadIcon sx={{ fontSize: '18px' }} />}
          />
        </form>
        <Button onClick={() => setQrScannerOpen(!qrScannerOpen)} variant="outlinedPrimary">
          <QrCodeScannerIcon sx={{ mr: 1 }} /> Scan Code
        </Button>
        <span className="mt-4">or</span>
        <h3>Want to create a new lobby?</h3>
        <Button onClick={handleLobbyClick} variant="primary" fullWidth>
          Host Lobby
        </Button>
      </TornContainer>
      <Snackbar
        key="waitlist-snack"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={waitlistMsgOpen}
        // autoHideDuration={5000}
        slots={{ transition: Slide }}
        onClose={handleWaitlistClose}
      >
        <div className="flex flex-row items-center justify-center px-6 py-4 bg-gray-900">
          <p className="text-xs">Wanna stay in the loop?</p>
          <Link href="/waitlist">
            <button type="button" className="text-sm text-primary underline ml-3 mr-5">
              Join Waitlist
            </button>
          </Link>
          <IconButton onClick={handleWaitlistClose}>
            <CloseIcon sx={{ color: '#FFF', fontSize: 18 }} />
          </IconButton>
        </div>
      </Snackbar>
    </div>
  );
}
