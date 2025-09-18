import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

// import { useUser } from "@/components/contexts/userContext";
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
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
        }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#BD9CEA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: 18,
            color: "#070217",
            userSelect: "none",
          }}
        >
          {/* Simple user icon SVG */}
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" fill="#070217" />
            <rect x="6" y="14" width="12" height="6" rx="3" fill="#070217" />
          </svg>
        </span>
        {/* <span style={{ fontSize: 16, color: "#333" }}>{userName}⌄ </span> */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          style={{ marginLeft: 4 }}
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
          style={{
            position: "absolute",
            right: 0,
            marginTop: 8,
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            borderRadius: 4,
            minWidth: 140,
            zIndex: 1000,
          }}
        >
          {menuItems.map((item, idx) => (
            <button
              key={item.label}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: 15,
                color: "#333",
                borderBottom: idx < menuItems.length - 1 ? "1px solid #eee" : "none",
              }}
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