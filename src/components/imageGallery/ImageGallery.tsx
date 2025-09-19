import React, { useState } from 'react';

import Image from 'next/image';

import clx from 'classnames';

import DownloadIcon from '@mui/icons-material/Download';

import Button from '../ui/button';

import './imageGallery.scss';

interface UploadedImage {
  file: File;
  previewUrl: string;
};

interface ImageGalleryProps {
  images: string[];
  hideRemove?: boolean;
  showDownload?: boolean;
  setImages?: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  handleRemoveImage?: (idx: number) => void;
  handleReorderImage?: (idx: number, direction: number) => void;
};

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  hideRemove = false,
  showDownload = false,
  setImages,
  handleRemoveImage,
  handleReorderImage,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  }

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <ul className="py-3 polaroids w-full gallery-container">
        {images.map((image, idx) => (
          <li
            key={`img-container-${idx}`}
            className={clx({
              "thumbnail-container shadow-xl": true,
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

      {isModalOpen && (
        <div
          onClick={closeModal}
          className="modal fixed inset-0 flex items-center justify-center z-[1000]"
        >
          <div className="relative gallery-image">
            <button
              onClick={closeModal}
              className="absolute !top-[-10px] text-3xl delete-btn cursor-pointer"
              aria-label="Close"
              type="button"
            >
              &times;
            </button>
            <div className="img-container">

              <img
                src={images[currentIndex]}
                alt={`Modal ${currentIndex}`}
                className="max-h-[70vh] max-w-[85vw]"
                onClick={e => e.stopPropagation()}
              />
            </div>

            <div className="h-[50px] rounded-sm w-full flex justify-center items-center">
              {showDownload &&
                <a href={images[currentIndex]} download>
                  <Button>
                    <DownloadIcon />
                  </Button>
                </a>
              }
            </div>

          </div>
          <div className="absolute bottom-0 w-full flex flex-row gap-5 pb-5 justify-center items-center">
            <button
              onClick={showPrev}
              className="gallery-btn text-4xl border-none cursor-pointer"
              aria-label="Previous"
              type="button"
            >
              {'<'}
            </button>
            <span>
              {currentIndex + 1} / {images.length}
            </span>
            <button
              onClick={showNext}
              className="gallery-btn text-4xl  border-none cursor-pointer"
              aria-label="Next"
              type="button"
            >
              {'>'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
