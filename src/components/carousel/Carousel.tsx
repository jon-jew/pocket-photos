import React, { useState } from 'react';

import Image from 'next/image';

import DownloadIcon from '@mui/icons-material/Download';

import './carousel.scss';

interface CarouselProps {
  images: string[];
  initialCurrent?: number;
  width?: string;
  height?: string;
  showDownload?: boolean;
}

const Carousel: React.FC<CarouselProps> = ({
  initialCurrent = 0,
  images,
  showDownload = false,
}) => {
  const [current, setCurrent] = useState(initialCurrent);

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
                  <div
                    className="h-[40px] text-secondary rounded-sm w-full flex justify-center items-center"
                  >
                    {idx + 1} / {images.length}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* <div className="gallery">
        {images.map((src, idx) => (
          <div
            key={`gallery-img-${idx}`}
            className={clx({
              "w-full gallery-img": true,
              "prev": idx === current - 1 || (current === 0 && idx === images.length - 1),
              "next": idx === current + 1 || (current === images.length - 1 && idx === 0),
              "active": idx === current,
            })}
            style={{
              transform: `rotate(${Math.floor(Math.random() * 15) - 7}deg)`,
            }}
          >
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
      </div> */}
      <div className="absolute bottom-0 bg-secondary w-full flex flex-row gap-5 pb-7 pt-2 justify-center z-10 items-center">
        <button
          onClick={prevSlide}
          className="gallery-btn text-4xl cursor-pointer"
          aria-label="Previous"
          type="button"
        >
          {'<'}
        </button>
        {showDownload &&
          <a href={images[current]} download>
            <button type="button">
              <DownloadIcon />
            </button>
          </a>
        }
        <button
          onClick={nextSlide}
          className="gallery-btn text-4xl cursor-pointer"
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
