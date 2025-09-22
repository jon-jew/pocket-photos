import React from "react";

import Image from "next/image";

import UserDropdown from '@/components/ui/userDropdown';

interface IconHeaderProps {
  isLoading?: boolean;
  showLogin?: boolean;
};

const IconHeader: React.FC<IconHeaderProps> = ({ isLoading, showLogin = false }) => {
  return (
    <div className="centered-col relative w-full max-w-xl !justify-end h-[300px] text-primary mb-8">
      <div className="absolute top-[20px] right-[10px]">
        {showLogin && <UserDropdown />}
      </div>
      {isLoading ?
        <Image
          alt="Logo"
          className="mb-3"
          width={125}
          height={120}
          src="/loading.gif"
        /> :
        <Image
          alt="Logo"
          className="mb-3"
          width={125}
          height={120}
          src="/logo.svg"
        />
      }
      <h1 className="leading-[48px]">PLUUR</h1>
      <p className="leading-[20px]">
        Create a photo album<br />together, instantly
      </p>
    </div>
  );
};

export default IconHeader;
