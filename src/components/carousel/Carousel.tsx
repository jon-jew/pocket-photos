import React, { useState } from 'react';

import Image from 'next/image';
import { useSwipeable } from 'react-swipeable';
import clx from 'classnames';

import DownloadIcon from '@mui/icons-material/Download';

import { XHRRequest } from '@/library/firebase/imageClient';
import ReactionButton from '@/components/ui/reactionButton';
import Button from '@/components/ui/button';

import './carousel.scss';

interface CarouselProps {
  initialCurrent?: number;
  imageList: GalleryImageEntry[] | NewImageEntry[];
  reactionList?: ImageReactionEntry[];
  albumId?: string,
  currentUserId: string | undefined;
  showDownload?: boolean;
  hideReactionBtn?: boolean;
  closeModal?: () => void;
  onReactionSelect: (reaction: string, idx: number) => Promise<string | false | undefined>;
};

const Carousel: React.FC<CarouselProps> = ({
  initialCurrent = 0,
  imageList,
  reactionList,
  albumId,
  currentUserId,
  showDownload = false,
  hideReactionBtn = true,
  closeModal,
  onReactionSelect,
}) => {
  const [current, setCurrent] = useState(initialCurrent);
  const [confirmDownload, setConfirmDownload] = useState(false);
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);

  const prevSlide = () => {
    if (!confirmDownload)
      setCurrent((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    if (!confirmDownload)
      setCurrent((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  const handlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    onSwipedDown: closeModal,
    swipeDuration: 500,
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  const handleDownload = async () => {
    setConfirmDownload(true);
    const blob = await XHRRequest(imageList[current].imageUrl);
    setDownloadBlob(blob);
  };

  return (
    <>
      <div
        className="flex flex-col h-[100vh] relative overflow-hidden mx-auto"
        {...handlers}
      >
        <button
          onClick={closeModal}
          type="button"
          className="absolute close-btn top-8 left-8 text-2xl z-[3000] rounded-full px-4 py-2"
        >
          X
        </button>
        <div
          className="fixed w-full h-full z-[999]"
          onClick={closeModal}
        />
        <ul
          className="flex items-center transition-transform duration-500 ease-in-out h-[calc(100vh-50px)] z-[1000]"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {imageList.map((image, idx) =>
            <li
              key={`gallery-img-${idx}`}
              className="w-full"
            >
              <div className="w-[100vw] flex justify-center items-center">
                <div className="gallery-slide rounded-sm">
                  <div className="img-container">
                    <Image
                      priority={idx === current}
                      src={image.imageUrl}
                      alt={`Gallery image ${idx}`}
                      width={0}
                      height={0}
                      quality={100}
                      style={{ width: '100%', maxHeight: 'calc(100vh - 225px)', objectFit: 'contain' }}
                      sizes="80vw"
                    />
                  </div>
                  <div
                    className="relative h-[40px] px-2 text-secondary rounded-sm w-full flex justify-end items-center"
                  >
                    {("reactions" in image) && reactionList && albumId &&
                      <div className={clx({
                        "hide": hideReactionBtn,
                        "absolute bottom-0 left-0 fade-component": true,
                      })}>
                        <ReactionButton
                          displayString={reactionList[idx].reactionString}
                          selectedReaction={reactionList[idx].selectedReaction}
                          disableClick={currentUserId === undefined}
                          onReactionSelect={(reaction: string) => onReactionSelect(reaction, idx)}
                        />
                      </div>
                    }
                    <span className="text-xs">{idx + 1} / {imageList.length}</span>
                  </div>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
      <div className="control-container absolute bottom-0 w-full z-[1000]">
        <div className="w-full flex flex-row gap-24 pt-2 pb-8 bg-[#00000082] justify-center items-center">
          {!confirmDownload &&
            <button
              onClick={prevSlide}
              className="gallery-btn text-4xl cursor-pointer"
              aria-label="Previous"
              type="button"
            >
              {'<'}
            </button>
          }
          {(showDownload && !confirmDownload) &&
            <button onClick={handleDownload} className="bg-primary ring-blue-500/50 shadow-xl py-3 px-3 rounded-[50%] text-black" type="button">
              <DownloadIcon />
            </button>
          }
          {(showDownload && confirmDownload) &&
            <div className="mb-10 flex flex-col bg-[#00000082] p-4 rounded-lg gap-4 items-center text-center">
              <h3>Confirm download?</h3>
              <div className="flex flex-row gap-10 items-center">

                <Button type="button" onClick={() => setConfirmDownload(false)}>
                  Cancel
                </Button>

                <a href={downloadBlob ? URL.createObjectURL(downloadBlob) : ''} download={`plurr-${current}`}>
                  <Button onClick={() => setConfirmDownload(false)} variant="secondary" type="button">
                    Confirm
                  </Button>
                </a>
              </div>
            </div>
          }
          {!confirmDownload &&
            <button
              onClick={nextSlide}
              className="gallery-btn text-4xl cursor-pointer"
              aria-label="Next"
              type="button"
            >
              {'>'}
            </button>
          }
        </div>
      </div>
    </>
  );
};

export default Carousel;
