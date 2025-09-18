import React, { useState } from 'react';

import Image from 'next/image';

import clx from 'classnames';

import './imageGallery.scss';

interface ImageGalleryProps {
  images: string[];
  setImages?: React.Dispatch<React.SetStateAction<string[]>>;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, setImages }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

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
        {images.map((src, idx) => (
          <li key={`img-container-${Math.random()}`} className="thumbnail-container shadow-xl">
            <button
              type="button"
              onClick={() => openModal(idx)}
              className="thumbnail w-38 h-38 relative rounded-sm overflow-hidden">
              <Image
                src={src}
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
              {idx !== 0 && setImages &&
                <button
                  type="button"
                  className="thumbnail-control"
                  onClick={e => {
                    e.stopPropagation();
                    if (idx > 0) {
                      const newImages = [...images];
                      [newImages[idx - 1], newImages[idx]] = [newImages[idx], newImages[idx - 1]];
                      setImages(newImages);
                    }
                  }}
                  aria-label="Move left"
                >
                  &lt;
                </button>
              }
              {idx !== images.length - 1 && setImages &&
                <button
                  type="button"
                  className="thumbnail-control"
                  onClick={e => {
                    e.stopPropagation();
                    if (idx < images.length - 1) {
                      const newImages = [...images];
                      [newImages[idx + 1], newImages[idx]] = [newImages[idx], newImages[idx + 1]];
                      setImages(newImages);
                    }
                  }}
                  disabled={idx === images.length - 1}
                  aria-label="Move right"
                >
                  &gt;
                </button>
              }
            </div>
          </li>
        ))}
      </ul>

      {isModalOpen && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[1000]"
        >
          <button
            onClick={showPrev}
            className="absolute left-10 top-1/2 -translate-y-1/2 text-4xl text-white bg-none border-none cursor-pointer"
            aria-label="Previous"
            type="button"
          >
            &#8592;
          </button>
          <img
            src={images[currentIndex]}
            alt={`Modal ${currentIndex}`}
            className="max-h-[80vh] max-w-[80vw] rounded-lg shadow-lg"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={showNext}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-4xl text-white bg-none border-none cursor-pointer"
            aria-label="Next"
            type="button"
          >
            &#8594;
          </button>
          <button
            onClick={closeModal}
            className="absolute top-8 right-8 text-3xl text-white bg-none border-none cursor-pointer"
            aria-label="Close"
            type="button"
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
