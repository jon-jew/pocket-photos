'use client';

import React from 'react';
import Image from 'next/image';
import clx from 'classnames';
import { useInView } from 'react-intersection-observer';

import ImageIcon from '@mui/icons-material/Image';

import ReactionButton from '@/components/ui/reactionButton';

import './thumbnail.scss';


interface ThumbnailProps {
  idx: number;
  src: string;
  albumId?: string;
  currentUserId: string | undefined;
  reactionEntry?: ImageReactionEntry;
  imagesLength: number;
  editMode?: boolean;
  openModal?: () => void;
  handleRemoveImage?: (idx: number) => void;
  handleReorderImage?: (idx: number, direction: -1 | 1) => void;
  onReactionSelect: (reaction: string, idx: number) => Promise<string | false | undefined>;
  quality?: number;
}

export default function Thumbnail({
  idx,
  src,
  albumId,
  currentUserId,
  reactionEntry,
  imagesLength,
  editMode = false,
  quality = 80,
  openModal,
  handleRemoveImage,
  handleReorderImage,
  onReactionSelect,
}: ThumbnailProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5
  });

  return (
    <li
      key={`img-container-${idx}`}
      className={clx({
        "thumbnail-container shadow-lg relative": true,
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
      <div
        className={clx({
          'thumbnail': true,
          'animate-pulse': !inView,
        })}
      >
        <button
          className={clx({
            'h-full w-full fade-in': true,
            'opacity-0': !inView,
          })}
          type="button"
          onClick={openModal}
        >
          <Image
            ref={ref}
            src={src}
            quality={quality}
            fill
            priority={idx < 6}
            alt={`Image ${idx + 1}`}
            sizes='160px'
            style={{ objectFit: 'cover' }}
          />
        </button>
      </div>
      {albumId && reactionEntry &&
        <div className={clx({
          "hide": editMode,
          "absolute bottom-0 left-0 fade-component thumbnail-reaction": true,
        })}>
          <ReactionButton
            displayString={reactionEntry.reactionString}
            selectedReaction={reactionEntry.selectedReaction ? reactionEntry.selectedReaction : null}
            disableClick={currentUserId === undefined}
            onReactionSelect={(reaction: string) => onReactionSelect(reaction, idx)}
          />
        </div>
      }

      <div className={clx({
        "flex items-center h-[30px]": true,
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
