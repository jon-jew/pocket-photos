import React from 'react';
import Image from 'next/image';
import LinearProgress from '@mui/material/LinearProgress';

interface LoadingProps {
  progress?: number | null;
};

const Loading: React.FC<LoadingProps> = ({ progress }) => (
  <div className="flex flex-col min-h-screen items-center justify-center">
    <Image priority src="/loading.gif" alt="loading" width={100} height={100} />
    {(typeof progress === 'number' && progress !== -1) &&
      <div className="w-7/10 max-w-[400px] mt-12">
        <LinearProgress color="secondary" variant="determinate" value={progress} />
      </div>
    }
  </div>
);

export default Loading;
