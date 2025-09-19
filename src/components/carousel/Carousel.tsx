import React, { useState } from 'react';

import Image from 'next/image';

import DownloadIcon from '@mui/icons-material/Download';

import Button from '../ui/button';

import './carousel.scss';

interface CarouselProps {
  images: string[];
  width?: string;
  height?: string;
  showDownload?: boolean;
}

const Carousel: React.FC<CarouselProps> = ({
  images,
  showDownload = false,
}) => {
  const [current, setCurrent] = useState(0);

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div
        className="relative overflow-hidden mx-auto"
      >
        <div
          className="flex items-center transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((src, idx) => (
            <div key={`gallery-img-${idx}`} className="w-full">
              <div className="w-[100vw] flex justify-center items-center">
                <div className="gallery-slide rounded-sm">
                  <div className="img-container">
                    <Image
                      src={src}
                      alt={`Gallery image ${idx}`}
                      width={0}
                      height={0}
                      style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                      sizes="80vw"
                    />
                  </div>
                  <div className="h-[40px] text-secondary rounded-sm w-full flex justify-center items-center">
                    {idx + 1} / {images.length}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 w-full flex flex-row gap-5 pb-8 justify-center items-center">
        <button
          onClick={prevSlide}
          className="gallery-btn text-4xl border-none cursor-pointer"
          aria-label="Previous"
          type="button"
        >
          {'<'}
        </button>
        {showDownload &&
          <a href={images[current]} download>
            <Button variant="secondary">
              <DownloadIcon />
            </Button>
          </a>
        }
        <button
          onClick={nextSlide}
          className="gallery-btn text-4xl  border-none cursor-pointer"
          aria-label="Next"
          type="button"
        >
          {'>'}
        </button>
      </div>
    </>
  );
};

export default Carousel;
