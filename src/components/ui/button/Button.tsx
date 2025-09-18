import React from 'react';

import Link from 'next/link';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary';
};

const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  disabled = false,
  variant = 'primary',
  href,
  onClick,
  fullWidth = false,
  ...props
}) => {
  const baseStyle =
    `px-4 py-2 max-w-[400px] rounded-md focus:outline-none transition duration-200
    disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none`;
  const variantStyle =
    variant === 'primary'
      ? 'bg-secondary text-primary hover:not-disabled:bg-secondary-hover'
      : 'bg-primary text-secondary hover:not-disabled:bg-primary-hover';

  if (href) {
    return (
      <Link className={`${fullWidth ? 'w-full' : ''}`} href={href}>
        <button
          type="button"
          disabled={disabled}
          className={`${baseStyle} ${variantStyle} ${fullWidth ? 'w-full' : ''}`}
          {...props}
        >
          {children}
        </button>
      </Link>
    )
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick ? onClick : undefined}
      className={`${baseStyle} ${variantStyle} ${fullWidth ? 'w-full' : ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;