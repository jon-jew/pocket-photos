import React from 'react';
import Image from 'next/image';
import clx from 'classnames';

interface TornContainerProps {
  children: React.ReactNode;
  smallXPadding?: boolean;
};

const TornContainer: React.FC<TornContainerProps> = ({ children, smallXPadding }) => {
  return (
    <div className="flex flex-col max-w-xl grow w-full">
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
    </div>
  );
};

export default TornContainer;
