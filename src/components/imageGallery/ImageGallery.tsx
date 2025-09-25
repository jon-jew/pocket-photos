'use client';

import React, { useState } from 'react';

import Image from 'next/image';
import clx from 'classnames';

import ImageIcon from '@mui/icons-material/Image';
import Modal from '@mui/material/Modal';
import { Slide } from '@mui/material';

import Carousel from '@/components/carousel';

import './imageGallery.scss';

interface ImageGalleryProps {
  images: string[];
  editMode?: boolean;
  showDownload?: boolean;
  variant?: 'primary' | 'secondary';
  onModalOpen?: () => void;
  handleRemoveImage?: (idx: number) => void;
  handleReorderImage?: (idx: number, direction: -1 | 1) => void;
};

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  editMode = false,
  showDownload = false,
  variant = 'primary',
  onModalOpen,
  handleRemoveImage,
  handleReorderImage,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const openModal = (idx: number) => {
    setIsModalOpen(true);
    setSelectedIndex(idx);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <ul className="py-8 polaroids w-full gallery-container">
        {images.map((image, idx) => (
          <li
            key={`img-container-${idx}`}
            className={clx({
              "thumbnail-container shadow-lg": true,
            })}
          >
            {handleRemoveImage &&
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(idx);
                }}
                className={clx({
                  "hide": !editMode,
                  "delete-btn fade-component": true,
                })}
              >
                <span>x</span><ImageIcon sx={{ fontSize: '18px' }}/>
              </button>
            }
            <button
              type="button"
              onClick={() => {
                if (onModalOpen) onModalOpen();
                openModal(idx)}
              }
              className="thumbnail w-38 h-38 relative rounded-sm overflow-hidden"
            >
              <Image
                src={image}
                quality={10}
                alt={`Gallery ${idx}`}
                fill
                style={{ objectFit: 'cover' }}
              />
            </button>

            <div className={clx({
              "flex items-center h-[20px]": true,
              "justify-between": idx !== 0,
              "justify-end": idx === 0,
            })}>
              {idx !== 0 && handleReorderImage &&
                <button
                  type="button"
                  className={clx({
                    "hide": !editMode,
                    "thumbnail-control fade-component": true,
                  })}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReorderImage(idx, -1);
                  }}
                  aria-label="Move left"
                >
                  {'<'}
                </button>
              }
              {idx !== images.length - 1 && handleReorderImage &&
                <button
                  type="button"
                  className={clx({
                    "hide": !editMode,
                    "thumbnail-control fade-component": true,
                  })}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReorderImage(idx, 1);
                  }}
                  disabled={idx === images.length - 1}
                  aria-label="Move right"
                >
                  {'>'}
                </button>
              }
            </div>
          </li>
        ))}
      </ul>
      <Modal
        open={isModalOpen}
        onClose={closeModal}
      >
        <Slide direction="up" in={isModalOpen} mountOnEnter unmountOnExit>
          <div
            className="fixed inset-0 flex items-center justify-center z-[1000]"
          >
            <Carousel initialCurrent={selectedIndex} images={images} showDownload={showDownload} />
            <button
              onClick={closeModal}
              className="absolute !top-[30px] !left-[20px] !text-3xl delete-btn cursor-pointer"
              aria-label="Close"
              type="button"
            >
              &times;
            </button>
          </div>
        </Slide>
      </Modal>
    </>
  );
};

export default ImageGallery;
