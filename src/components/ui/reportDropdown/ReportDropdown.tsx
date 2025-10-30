'use client';

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import clx from 'classnames';

import Modal from '@mui/material/Modal';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReportIcon from '@mui/icons-material/Report';

import { createReport } from "@/library/firebase/reportClient";
import Button from '@/components/ui/button';
import Textfield from "@/components/ui/textfield";

interface MenuItem {
  label: string;
  onClick?: () => void;
  href?: string;
  color?: string;
};

interface ReportDropdownProps {
  albumId: string;
};

export const ReportDropdown: React.FC<ReportDropdownProps> = ({ albumId }) => {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [reportOpen, setReportOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [desc, setDesc] = useState<string>('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  const menuItems: MenuItem[] = [
    { label: "Report", onClick: () => setReportOpen(true), color: 'red' },
  ];

  const handleCloseReport = () => {
    setReportOpen(false);
  };

  const handleSubmitReport = () => {
    createReport(albumId, email, desc);
    setReportOpen(false);
  };

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

  return (
    <div ref={dropdownRef} className="inline-block relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="bg-none border-none cursor-pointer text-primary"
        aria-haspopup="true"
        aria-expanded={open}
        type="button"
      >
        <MoreVertIcon />
      </button>
      {open && (
        <div
          className="absolute left-0 bg-white shadow-lg rounded min-w-[80px] z-[3000]"
        >
          {menuItems.map((item, idx) => (
            <button
              key={item.label}
              onClick={() => {
                setOpen(false);
                if (item.onClick) item.onClick();
                if (item.href) router.push(item.href);
              }}
              className={clx({
                'w-full px-4 py-2 bg-none border-none text-left cursor-pointer text-[15px] text-[#333]': true,
                'border-b border-[#eee]': idx < menuItems.length - 1,
                'text-red-600': item.color == 'red',
              })}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <Modal open={reportOpen} onClose={handleCloseReport}>
        <div
          className="fixed inset-0 flex items-center justify-center z-[1000]"
        >
          <button
            onClick={handleCloseReport}
            type="button"
            className="close-btn absolute top-8 left-8 text-2xl"
          >
            X
          </button>
          <div
            className="fixed w-full h-full z-[999]"
            onClick={handleCloseReport}
          />
          <div className="bg-primary text-secondary rounded-lg relative px-2 py-4 w-[85%] max-w-[500px] z-[1000]">
            <h2 className="text-2xl mb-3"><ReportIcon /> Report Album</h2>
            <form
              onSubmit={handleSubmitReport}
              className="flex flex-col gap-5 justify-center items-center"
            >
              <p className="px-4 py-2">
                Please provide a description of the offending material and a contact email.
              </p>
              <Textfield
                fullWidth
                initialValue={''}
                onChange={(e) => setEmail(e.target.value)}
                label="Contact Email"
                required
              />
              <Textfield
                fullWidth
                initialValue={''}
                onChange={(e) => setDesc(e.target.value)}
                label="Description"
                required
              />
              <Button
                type="submit"
                fullWidth
                disabled={email === '' || desc === ''}
              >
                Submit
              </Button>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReportDropdown;
