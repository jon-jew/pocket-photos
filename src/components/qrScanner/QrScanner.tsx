import React, { Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { Scanner } from '@yudiel/react-qr-scanner';
import { toast } from 'react-toastify';

import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import IconButton from '@mui/material/IconButton';

import CloseIcon from '@mui/icons-material/Close';

interface Code {
  format: string;
  rawValue: string;
}

interface QrScannerProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const QrScanner: React.FC<QrScannerProps> = ({
  isOpen,
  setIsOpen
}) => {
  const router = useRouter();

  const handleScan = (detectedCodes: Code[]) => {
    detectedCodes.forEach(code => {
      if (code.format === 'qr_code') {
        const regex = /plurr.it\/lobby\//;
        const match = regex.test(code.rawValue);
        if (match) {
          const lobbyCode = code.rawValue.replace('plurr.it/lobby/', '').replace('?scanned=true', '');
          if (/^[a-zA-Z0-9]{6}$/.test(lobbyCode)) {
            router.push(`/lobby/${lobbyCode}?scanned=true`);
          }
        }
      }
    });
  };

  return (
    <SwipeableDrawer
      anchor="top"
      keepMounted={false}
      open={isOpen}
      onClose={() => setIsOpen(false)}
      onOpen={() => setIsOpen(true)}
    >
      <div className="relative w-full text-center">
        <IconButton
          onClick={() => setIsOpen(false)}
          sx={{
            position: 'absolute',
            top: 6,
            left: 6,
            zIndex: 10,
            color: '#FFF',
            backgroundColor: '#06060689',
            '&:hover': {
              backgroundColor: '#7676768b',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
        <div className="absolute w-full flex justify-center  bottom-2 z-10">
          <h4 className="text-white bg-[#06060689] px-4 py-2 rounded-md">
            Scan the lobby code to join!
          </h4>
        </div>
        {isOpen &&
          <Scanner
            onScan={handleScan}
            onError={(error) => {
              console.error(error);
              toast.error('Failed to open camera. Check permissions');
              setIsOpen(false);
            }}
          />
        }
      </div>
    </SwipeableDrawer>
  );
}

export default QrScanner;

