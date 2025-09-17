import React from 'react';
import Image from 'next/image';

interface TornContainerProps {
  children: React.ReactNode;
};

const TornContainer: React.FC<TornContainerProps> = ({ children }) => {
  return (
    <div className="flex flex-col max-w-xl grow w-full">
      <div className="h-[35px] w-full relative">
      <Image src="/tornEdge.png" alt="torn edge" fill />
      </div>
      <div
        className="centered-col grow !justify-start bg-primary text-secondary
        gap-3 w-full px-6 pt-1 pb-5"
      >
        {children}
      </div>
    </div>
  );
};

export default TornContainer;
