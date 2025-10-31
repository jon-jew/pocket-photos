import React from "react";

import Image from "next/image";

import UserDropdown from '@/components/ui/userDropdown';

interface IconHeaderProps {
  showLogin?: boolean;
  user?: UserInfo | undefined;
};

const IconHeader: React.FC<IconHeaderProps> = ({ showLogin = false, user }) => {
  return (
    <div className="centered-col relative w-full max-w-xl !justify-end h-[300px] text-primary mb-8">
      {showLogin && <UserDropdown user={user} />}
      <Image
        priority
        alt="Plurr Logo"
        className="mb-3"
        width={125}
        height={120}
        src="/logo.svg"
      />
      <h1 className="leading-[48px]">PLURR</h1>
      <p className="leading-[20px]">
        Do now.<br />Connect later
      </p>
    </div>
  );
};

export default IconHeader;
