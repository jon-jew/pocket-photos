"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { toast } from 'react-toastify';

import Switch from '@mui/material/Switch';

import TuneIcon from '@mui/icons-material/Tune';
// import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

import { editAlbumFields, deleteAlbum } from '@/library/firebase/imageClient';
import Button from '@/components/ui/button';
import Textfield from '@/components/ui/textfield';

interface OptionsFormProps {
  albumId: string;
  currentUser: User | undefined;
  initialAlbumName: string;
  initialViewersCanEdit: boolean;
  closeOptions: (reload: boolean, loading: boolean) => void;
}

const OptionsForm: React.FC<OptionsFormProps> = ({
  albumId,
  currentUser,
  initialAlbumName = '',
  initialViewersCanEdit = true,
  closeOptions,
}) => {
  const router = useRouter();

  const [showDelete, setShowDelete] = useState<boolean>(false);
  const [albumName, setAlbumName] = useState<string>(initialAlbumName);
  const [viewersCanEdit, setViewersCanEdit] = useState<boolean>(initialViewersCanEdit);

  const handleOptionsSubmit = () => {
    editAlbumFields(albumId, albumName, viewersCanEdit);
    closeOptions(true, true);
    toast.success('Saved Changes');
  };

  const handleDelete = async () => {
    closeOptions(false, true);
    const delRes = await deleteAlbum(albumId);
    if (delRes) {
      router.push('/my-lobbies');
      toast.success('Album deleted');
    } else {
      closeOptions(false, false);
    }
  };

  return (
    <div className="bg-black text-white rounded-lg relative px-2 py-4 w-[85%] max-w-[500px] z-[1000]">
      <h2 className="text-2xl text-primary mb-10">
        <TuneIcon /> Options
      </h2>
      {!showDelete ?
        <>
          <div className="absolute top-3 right-3">
            <Button onClick={() => setShowDelete(true)} variant="warning">
              <span className="text-xs mr-2">X</span> Delete
            </Button>
          </div>

          <form onSubmit={handleOptionsSubmit} className="flex flex-col gap-5 justify-center items-center">
            <Textfield
              variant="secondary"
              fullWidth
              initialValue={initialAlbumName}
              onChange={(e) => setAlbumName(e.target.value)}
              label="Album Name"
              required
            />
            <div>
              <Switch
                checked={viewersCanEdit}
                onChange={() => setViewersCanEdit(!viewersCanEdit)}
                sx={{
                  // Styles for the unchecked track
                  '.MuiSwitch-track': {
                    backgroundColor: '#ffffff64', // Example unchecked track color
                    opacity: 1, // Ensure full opacity if needed
                  },
                  // Styles for the checked track
                }}
                color="primary"
              />
              <span className="text-xs">Viewers can add images</span>
            </div>
            <Button
              type="submit"
              fullWidth
              variant="secondary"
            >
              Save
            </Button>
          </form>
        </> :
        <div className="flex flex-col items-center justify-center gap-9 min-h-[170px]">
          <h4>Are you sure you want to delete?</h4>
          <div className="flex flex-row gap-8">
            <button className="text-gray-400" onClick={() => setShowDelete(false)}>
              Cancel
            </button>
            <Button onClick={handleDelete} variant="warning">
              <span className="text-xs mr-2">X</span> Delete
            </Button>
          </div>
        </div>
      }
    </div>
  );
};

export default OptionsForm;
