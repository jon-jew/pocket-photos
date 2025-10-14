import React from 'react';
import clx from 'classnames';

interface IconButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  chevronState?: 'up' | 'down' | null;
}

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  children,
  chevronState = null,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex flex-row justify-center items-center text-secondary"
  >
    {children}
    {chevronState !== null &&
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        className={clx({
          'rotate-180': chevronState === 'up',
        })}
      >
        <path
          d="M5 8l5 5 5-5"
          stroke="#070217"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    }
  </button>
);

export default IconButton;
