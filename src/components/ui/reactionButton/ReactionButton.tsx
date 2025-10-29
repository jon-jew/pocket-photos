import React, { useState, useRef, useEffect } from 'react';
import clx from 'classnames';

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import './reactionButton.scss';

interface ReactionButtonProps {
  onReactionSelect: (reaction: string) => Promise<string | false | undefined> | undefined;
  displayString: string;
  disableClick?: boolean;
  selectedReaction?: string | null;
}

const ReactionButton: React.FC<ReactionButtonProps> = ({
  onReactionSelect,
  displayString,
  disableClick = true,
  selectedReaction,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const reactions = ['👍', '😛', '😂', '😮', '✨', '🎉'];

  const handleMouseDown = (event: { cancelable: boolean; preventDefault: () => void; }) => {
    timeoutRef.current = setTimeout(() => {
      if (buttonRef.current) {
        if (event.cancelable) event.preventDefault();
        const rect = buttonRef.current.getBoundingClientRect();
        setIsOpen(true);
      }
    }, 250); // Open after 250ms hold
  };

  const handleMouseUp = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleReactionSelect = async (reaction: string) => {
    setIsOpen(false);
    await onReactionSelect(reaction);
  };

  const handleClick = async () => {
    if (!isOpen) {
      await onReactionSelect('like');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="relative"
      ref={buttonRef}
    >
      <button
        className={clx({
          "pointer-events-none": disableClick,
          "reaction-btn p-2 text-primary rounded-full hover:bg-gray-100 transition-colors duration-200": true,
        })}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        {selectedReaction ? <FavoriteIcon /> : <FavoriteBorderIcon />} <span className="text-gray-600">{displayString}</span>
      </button>
      <div
        onContextMenu={(e) => e.preventDefault()}
        className={clx({
          "reaction-menu shadow-lg fade-component": true,
          "hide": !isOpen,
        })}
      >
        {reactions.map((reaction) => (
          <button
            key={reaction}
            className={clx({
              "px-3 py-2 text-xl hover:bg-gray-100 rounded-full transition-colors duration-200": true,
              "bg-primary": reaction === selectedReaction,
            })}
            onClick={() => handleReactionSelect(reaction)}
          >
            {reaction}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReactionButton;
