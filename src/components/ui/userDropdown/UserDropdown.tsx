'use client';

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";

import { logoutUser } from "@/library/firebase/auth";

interface MenuItem {
  label: string;
  onClick?: () => void;
  href?: string;
};

interface UserDropdownProps {
  variant?: 'primary' | 'secondary';
  user?: User | undefined;
};

export const UserDropdown: React.FC<UserDropdownProps> = ({
  variant = 'primary',
  user,
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const backgroundColor = variant === 'primary' ? '#BD9CEA' : '#070217';
  const iconColor = variant === 'primary' ? '#070217' : '#BD9CEA'

  const menuItems: MenuItem[] = [
    { label: "Home", href: '/' },
    { label: "My Lobbies", href: `/user-albums/${user ? user.uid : ''}` },
    { label: "Logout", onClick: () => logoutUser(router) },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (!user) {
    return (
      <Link
        className={`absolute z-10 top-4 right-4 text-${variant}`}
        href="/login">Login
      </Link>
    );
  }

  return (
    <div ref={dropdownRef} className="absolute z-10 top-4 right-4 inline-block">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="bg-none border-none cursor-pointer p-0 flex items-center"
        aria-haspopup="true"
        aria-expanded={open}
        type="button"
      >
        <span
          style={{ backgroundColor: backgroundColor }}
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[18px] text-[${iconColor}] select-none`}
        >
          {/* Simple user icon SVG */}
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" fill={iconColor} />
            <rect x="6" y="14" width="12" height="6" rx="3" fill={iconColor} />
          </svg>
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="ml-1"
          aria-hidden="true"
        >
          <path
            d="M5 8l5 5 5-5"
            stroke={backgroundColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 bg-white shadow-lg rounded min-w-[140px] z-[1000]"
        >
          {menuItems.map((item, idx) => (
            <button
              key={item.label}
              onClick={() => {
                setOpen(false);
                if (item.onClick) item.onClick();
                if (item.href) router.push(item.href);
              }}
              className={`w-full px-4 py-2 bg-none border-none text-left cursor-pointer text-[15px] text-[#333] ${idx < menuItems.length - 1 ? "border-b border-[#eee]" : ""
                }`}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
