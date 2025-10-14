'use client';

import Image from 'next/image';
import clx from 'classnames';
import { useInView } from 'react-intersection-observer';

import ImageIcon from '@mui/icons-material/Image';

import './thumbnail.scss';

interface ThumbnailProps {
  src: string;
  alt: string;
  idx: number;
  imagesLength: number;
  editMode?: boolean;
  openModal?: () => void;
  handleRemoveImage?: (idx: number) => void;
  handleReorderImage?: (idx: number, direction: -1 | 1) => void;
  quality?: number;
}

export default function Thumbnail({
  src,
  alt,
  idx,
  imagesLength,
  editMode = false,
  openModal,
  handleRemoveImage,
  handleReorderImage,
  quality = 80,
}: ThumbnailProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5
  })

  return (
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
          <span>x</span><ImageIcon sx={{ fontSize: '18px' }} />
        </button>
      }
      <button
        type="button"
        onClick={openModal}
        className="thumbnail"
      >
        <Image
          ref={ref}
          src={src}
          quality={quality}
          fill
          priority={idx < 6}
          alt={alt}
          sizes='157.2px'
          style={{
            opacity: inView ? 1 : 0,
            transition: "opacity 0.2s cubic-bezier(0.3, 0.2, 0.2, 0.8)",
            objectFit: 'cover',
          }}
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
        {idx !== imagesLength - 1 && handleReorderImage &&
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
            disabled={idx === imagesLength - 1}
            aria-label="Move right"
          >
            {'>'}
          </button>
        }
      </div>
    </li>
  )
}
