import React from 'react';

import Link from 'next/link';

import clx from 'classnames';

import './button.scss';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'warning';
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
  const classes = clx({
    'btn px-4 py-2 max-w-[400px] rounded-md focus:shadow-lg': true,
    'w-full': fullWidth,
    'bg-secondary text-primary hover:not-disabled:bg-secondary-hover': variant === 'primary',
    'bg-primary text-secondary hover:not-disabled:bg-primary-hover': variant === 'secondary',
    'bg-warning text-white hover:not-disabled:bg-warning-hover': variant === 'warning',
  });

  if (href) {
    return (
      <Link className={`${fullWidth ? 'w-full' : ''}`} href={href}>
        <button
          type="button"
          disabled={disabled}
          className={classes}
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
      className={`${classes}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;