import React from "react";

import Image from "next/image";

import UserDropdown from '@/components/ui/userDropdown';

import './iconHeader.scss';

interface IconHeaderProps {
  showLogin?: boolean;
};

const IconHeader: React.FC<IconHeaderProps> = ({ showLogin = false }) => {
  return (
    <div className="centered-col relative w-full max-w-xl !justify-end h-[300px] text-primary mb-8">
      <div className="absolute z-10 top-[20px] right-[10px]">
        {showLogin && <UserDropdown />}
      </div>
      <Image
        alt="Logo"
        className="mb-3"
        width={125}
        height={120}
        src="/logo.svg"
      />
      <h1 className="leading-[48px]">PLUUR</h1>
      <p className="leading-[20px]">
        Create a photo album<br />together, instantly
      </p>
      <div className="bubbles">
        {Array.from({ length: 50 }).map((_, index) => (
          <div key={`bubble-${index}`} className="bubble" />
        ))}
      </div>
    </div>
  );
};

export default IconHeader;
