'use client';

import React, { useState } from 'react';

import Image from 'next/image';
import clx from 'classnames';

import Modal from '@mui/material/Modal';
import { Slide } from '@mui/material';

import Carousel from '@/components/carousel';

import './imageGallery.scss';

interface UploadedImage {
  file: File;
  previewUrl: string;
};

interface ImageGalleryProps {
  images: string[];
  hideRemove?: boolean;
  showDownload?: boolean;
  variant?: 'primary' | 'secondary';
  setImages?: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  handleRemoveImage?: (idx: number) => void;
  handleReorderImage?: (idx: number, direction: number) => void;
};

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  hideRemove = false,
  showDownload = false,
  variant = 'primary',
  setImages,
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
  }

  return (
    <>
      <ul className="py-8 polaroids w-full gallery-container">
        {images.map((image, idx) => (
          <li
            key={`img-container-${idx}`}
            className={clx({
              "thumbnail-container shadow-xl": true,
              "shadow-indigo-500/50": variant === 'secondary',
            })}
          >
            {!hideRemove && handleRemoveImage &&
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(idx);
                }}
                className="delete-btn"
              >
                X
              </button>
            }
            <button
              type="button"
              onClick={() => openModal(idx)}
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
              {idx !== 0 && setImages && handleReorderImage &&
                <button
                  type="button"
                  className="thumbnail-control"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReorderImage(idx, -1);
                  }}
                  aria-label="Move left"
                >
                  {'<'}
                </button>
              }
              {idx !== images.length - 1 && setImages && handleReorderImage &&
                <button
                  type="button"
                  className="thumbnail-control"
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
              onClick={closeModal}
              className="fixed inset-0 flex items-center justify-center z-[1000]"
            >
              <Carousel initialCurrent={selectedIndex} images={images} showDownload={showDownload} />
              <button
                onClick={closeModal}
                className="absolute !top-[30px] !left-[20px] text-3xl delete-btn cursor-pointer"
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
