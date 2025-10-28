'use client';

import React, { useState } from 'react';

import Modal from '@mui/material/Modal';
import { Slide } from '@mui/material';

import Carousel from '@/components/carousel';
import Thumbnail from '@/components/ui/thumbnail';

import { handleImageReaction } from '@/library/firebase/image';

import './imageGallery.scss';

interface ImageGalleryProps {
  imageList: GalleryImageEntry[] | NewImageEntry[];
  initialReactions?: ImageReactionEntry[];
  albumId?: string;
  currentUserId: string | undefined;
  editMode?: boolean;
  showDownload?: boolean;
  onModalOpen?: () => void;
  handleRemoveImage?: (idx: number) => void;
  handleReorderImage?: (idx: number, direction: -1 | 1) => void;
};

const ImageGallery: React.FC<ImageGalleryProps> = ({
  imageList,
  initialReactions,
  albumId,
  currentUserId,
  editMode = false,
  showDownload = false,
  onModalOpen,
  handleRemoveImage,
  handleReorderImage,
}) => {

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [reactionList, setReactionList] = useState<ImageReactionEntry[] | undefined>(initialReactions);

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

  const onReactionSelect = async (reaction: string, idx: number) => {
    if (currentUserId && albumId && reactionList) {
      const newReactionString = await handleImageReaction(
        currentUserId,
        reaction,
        albumId,
        idx,
      );

      if (typeof newReactionString === 'string') {
        const newReactionList = reactionList?.map((reactionEntry, i) => {
          if (i === idx) {
            if (reaction === 'like') {
              return {
                selectedReaction: reactionEntry.selectedReaction === null ? 'like' : null,
                reactionString: newReactionString,
              }
            }
            return {
              selectedReaction: reactionEntry.selectedReaction !== reaction ? reaction : null,
              reactionString: newReactionString,
            }
          } else {
            return reactionEntry;
          }
        });
        setReactionList(newReactionList);
      }

      return newReactionString;
    }
  };

  return (
    <>
      <ul className="py-4 polaroids w-full gallery-container">
        {imageList.map((image, idx) => (
          <Thumbnail
            key={`thumbnail-${idx}`}
            idx={idx}
            src={image.imageUrl}
            albumId={albumId}
            currentUserId={currentUserId}
            reactionEntry={reactionList ? reactionList[idx] : undefined}
            imagesLength={imageList.length}
            editMode={editMode}
            openModal={() => openModal(idx)}
            handleRemoveImage={handleRemoveImage}
            handleReorderImage={handleReorderImage}
            onReactionSelect={onReactionSelect}
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
              initialCurrent={selectedIndex}
              imageList={imageList}
              reactionList={reactionList}
              albumId={albumId}
              currentUserId={currentUserId}
              showDownload={showDownload}
              hideReactionBtn={editMode}
              closeModal={closeModal}
              onReactionSelect={onReactionSelect}
            />
          </div>
        </Slide>
      </Modal>
    </>
  );
};

export default ImageGallery;
