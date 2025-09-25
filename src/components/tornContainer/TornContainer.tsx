import React from 'react';
import Image from 'next/image';
import clx from 'classnames';

interface TornContainerProps {
  children: React.ReactNode;
  smallXPadding?: boolean;
  isLoading?: boolean;
};

const TornContainer: React.FC<TornContainerProps> = ({
  children,
  smallXPadding,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col grow w-full relative">
      <div className="h-[35px] w-full relative">
        <Image priority src="/tornEdge.png" alt="torn edge" fill />
      </div>
      <div className={clx({
        "centered-col grow !justify-start bg-primary text-secondary": true,
        "gap-3 w-full px-6 pt-1 pb-5": true,
        // "[&>*]:transition-opacity [&>*]:duration-150": true,
        "!px-2 !gap-1": smallXPadding,
      })}>
        {children}
      </div>
      <div className={clx({
        "absolute bg-[#070217af] z-5 w-full h-full transition-[opacity] duration-150": true,
        "opacity-0 pointer-events-none": !isLoading,
      })}>
        <Image
          alt="Logo"
          className="fixed top-[400px] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          width={62}
          height={60}
          src="/loading.gif"
        />
      </div>
    </div>
  );
};

export default TornContainer;
