'use client';

import React, { useState, useRef, } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import clx from "classnames";

import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';

import MenuIcon from '@mui/icons-material/Menu';

import { logoutUser } from "@/library/firebase/auth";
import Button from '@/components/ui/button';

interface MenuItem {
  label: string;
  onClick?: () => void;
  href?: string;
  needsAuth: boolean;
};

interface UserDropdownProps {
  variant?: 'primary' | 'secondary';
  user?: User;
  currentPath?: string;
  prevAlbumId?: string;
};

export const UserDropdown: React.FC<UserDropdownProps> = ({
  variant = 'primary',
  user,
  currentPath,
  prevAlbumId,
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const menuItems: MenuItem[] = [
    { label: "Home", href: '/', needsAuth: false },
    { label: "My Lobbies", href: '/my-lobbies', needsAuth: true, },
    { label: 'Joined Lobbies', href: '/joined-lobbies', needsAuth: true, },
  ];

  const toggleDrawer =
    (open: boolean) =>
      (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
          event.type === 'keydown' &&
          ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
          return;
        }

        setOpen(open);
      };

  // if (!user) {
  //   return (
  //     <Link
  //       className={`absolute z-10 top-4 right-4 text-${variant}`}
  //       href={`/login${prevAlbumId ? `?prevAlbum=${prevAlbumId}` : ''}`}>Login
  //     </Link>
  //   );
  // }

  return (
    <div ref={dropdownRef} className="absolute z-10 top-4 right-4 inline-block">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={clx({
          "bg-none border-none cursor-pointer p-0 flex items-center": true,
          "text-primary": variant === 'primary',
          "text-secondary": variant === 'secondary',
        })}
        aria-haspopup="true"
        aria-expanded={open}
        type="button"
      >
        <MenuIcon />
      </button>
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
      >
        <div className="flex flex-col bg-black text-white h-screen pt-10 pb-8 px-2">
          <h2 className="w-full text-center !text-3xl text-primary mb-8">
            Plurr.it
          </h2>
          {menuItems.map((item, idx) => (
            <button
              key={item.label}
              onClick={() => {
                setOpen(false);
                if (item.onClick) item.onClick();
                if (item.href) router.push(item.href);
              }}
              className={clx({
                'w-full px-4 py-2 bg-none border-none text-left cursor-pointer text-[18px] text-gray-200': true,
                'border-b border-[#eee]': idx < menuItems.length - 1,
                'text-primary text-bold pointer-events-none': item.href === currentPath,
                'pointer-events-none text-gray-600': item.needsAuth && !user,
              })}
              type="button"
            >
              {item.label}
            </button>
          ))}
          <Divider />
          {user ?
            <button
              onClick={() => logoutUser(router)}
              className="w-full mt-5 px-4 py-2 bg-none border-none text-left cursor-pointer text-[15px] text-gray-400"
            >
              Logout
            </button> :
            <Link href={`/login${prevAlbumId ? `?prevLobby=${prevAlbumId}` : ''}`}>
              <button
                className="w-full mt-5 px-4 py-2 bg-none border-none text-left cursor-pointer text-[15px] text-gray-200"
              >
                Login
              </button>
            </Link>
          }
          <div className="flex flex-col grow w-full justify-end items-center gap-2">
            
            <Image
              priority
              alt="Plurr Logo"
              className="opacity-70"
              width={60}
              height={58}
              src="/logo.svg"
            />
            <p className="text-center leading-[20px] opacity-70 mb-3">
              Do now.<br />Connect later
            </p>
            <Button
              variant="secondary"
              href={`/waitlist${prevAlbumId ? `?prevLobby=${prevAlbumId}` : ''}`}
            >
              Join the waitlist!
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default UserDropdown;
