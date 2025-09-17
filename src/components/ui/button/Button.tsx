import React from 'react';

import Link from 'next/link';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  href?: string;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary';
};

const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  href,
  onClick,
  fullWidth = false,
  ...props
}) => {
  const baseStyle =
    'px-4 py-2 max-w-[400px] rounded-md focus:outline-none transition-colors duration-200';
  const variantStyle =
    variant === 'primary'
      ? 'bg-secondary text-primary hover:bg-secondary-hover'
      : 'bg-primary text-secondary hover:bg-primary-hover';

  if (href) {
    return (
      <Link className={`${fullWidth ? 'w-full' : ''}`} href={href}>
        <button
          type="button"
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
      onClick={onClick ? onClick : undefined}
      className={`${baseStyle} ${variantStyle} ${fullWidth ? 'w-full' : ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;