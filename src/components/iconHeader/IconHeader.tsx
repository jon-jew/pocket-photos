import React from "react";

import Image from "next/image";
import { User } from "firebase/auth";

import UserDropdown from '@/components/ui/userDropdown';

interface IconHeaderProps {
  showLogin?: boolean;
  currentUser?: User | undefined;
};

const IconHeader: React.FC<IconHeaderProps> = ({ showLogin = false, currentUser }) => {
  return (
    <div className="centered-col relative w-full max-w-xl !justify-end h-[300px] text-primary mb-8">
      {showLogin && <UserDropdown initialUser={currentUser} />}
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
    </div>
  );
};

export default IconHeader;
