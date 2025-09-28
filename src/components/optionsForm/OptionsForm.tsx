"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { toast } from 'react-toastify';

import Switch from '@mui/material/Switch';

import TuneIcon from '@mui/icons-material/Tune';
// import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

import { editAlbumFields, deleteAlbum } from '@/library/firebase/image';
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
      router.push(`/user-albums/${currentUser?.uid}`);
      toast.success('Album deleted');
    } else {
      toast.error('Failed to delete album');
      closeOptions(false, false);
    }
  };

  return (
    <div className="bg-primary text-secondary rounded-lg relative px-2 py-4 w-[85%] max-w-[500px]">
      <h2 className="text-3xl mb-6"><TuneIcon /> Options</h2>
      <button
        onClick={() => closeOptions(false, false)}
        type="button"
        className="absolute top-3 right-3 text-2xl"
      >
        X
      </button>
      <form onSubmit={handleOptionsSubmit} className="flex flex-col gap-5 justify-center items-center">
        <Textfield
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
            color="secondary"
          />
          <span className="text-xs">Viewers can add images</span>
        </div>
        <Button onClick={handleDelete} variant="warning">
          {/* <span className="text-xs">X</span><PhotoLibraryIcon /> */}
          <span className="text-xs mr-2">X</span> Delete
        </Button>
        <Button
          type="submit"
          fullWidth
        >
          Save
        </Button>
      </form>
    </div>
  );
};

export default OptionsForm;
