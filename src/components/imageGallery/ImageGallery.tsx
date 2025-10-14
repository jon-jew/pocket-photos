'use client';

import React, { useState } from 'react';

import Modal from '@mui/material/Modal';
import { Slide } from '@mui/material';

import Carousel from '@/components/carousel';
import Thumbnail from '@/components/ui/thumbnail';

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
    if (onModalOpen) {
      onModalOpen();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <ul className="py-4 polaroids w-full gallery-container">
        {images.map((image, idx) => (
          <Thumbnail
            key={`thumbnail-${idx}`}
            idx={idx}
            imagesLength={images.length}
            src={image}
            quality={10}
            alt={`Image ${idx + 1}`}
            editMode={editMode}
            openModal={() => openModal(idx)}
            handleRemoveImage={handleRemoveImage}
            handleReorderImage={handleReorderImage}
          />
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
            <Carousel
              closeModal={closeModal}
              initialCurrent={selectedIndex}
              images={images}
              showDownload={showDownload}
            />
          </div>
        </Slide>
      </Modal>
    </>
  );
};

export default ImageGallery;
