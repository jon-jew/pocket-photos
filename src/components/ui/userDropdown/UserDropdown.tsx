import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import useUser from '@/components/hooks/useUser';
import { logoutUser } from "@/library/firebase/auth";

interface MenuItem {
  label: string;
  onClick: () => void;
}

interface UserDropdownProps {
  menuItems?: MenuItem[];
}

const defaultMenuItems: MenuItem[] = [
  { label: "Profile", onClick: () => alert("Profile clicked") },
  { label: "Logout", onClick: () => logoutUser() },
];

export const UserDropdown: React.FC<UserDropdownProps> = ({
  menuItems = defaultMenuItems,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, userLoading } = useUser();

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

  if (userLoading) return null;
  if (!userLoading && !user) return <Link href="/login">Login</Link>;

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="bg-none border-none cursor-pointer p-0 flex items-center"
        aria-haspopup="true"
        aria-expanded={open}
        type="button"
      >
        <span
          className="w-8 h-8 rounded-full bg-[#BD9CEA] flex items-center justify-center font-bold text-[18px] text-[#070217] select-none"
        >
          {/* Simple user icon SVG */}
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" fill="#070217" />
            <rect x="6" y="14" width="12" height="6" rx="3" fill="#070217" />
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
            stroke="#BD9CEA"
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
                item.onClick();
              }}
              className={`w-full px-4 py-2 bg-none border-none text-left cursor-pointer text-[15px] text-[#333] ${
                idx < menuItems.length - 1 ? "border-b border-[#eee]" : ""
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
