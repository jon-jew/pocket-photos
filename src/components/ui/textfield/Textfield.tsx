'use client';

import React, { useState } from 'react';

import clx from 'classnames';

import CircularProgress from '@mui/material/CircularProgress';

import Button from '@/components/ui/button';

import './textfield.scss';

interface TextfieldProps {
  intialValue?: string;
  placeholder?: string;
  label?: string;
  type?: string;
  maxLength?: number;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  fullWidth?: boolean;
  required?: boolean;
  LeadingIcon?: React.ReactNode;
  buttonLabel?: string;
  buttonType?: 'button' | 'submit' | 'reset';
  buttonId?: string;
  buttonDisabled?: boolean;
  onButtonClick?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Textfield: React.FC<TextfieldProps> = ({
  intialValue,
  placeholder,
  label,
  type,
  maxLength,
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  required = false,
  LeadingIcon,
  buttonLabel,
  buttonType = 'button',
  buttonId,
  buttonDisabled = false,
  onButtonClick,
  onChange,
}) => {
  const [value, setValue] = useState(intialValue || '');

  const inputClasses = clx({
    'textfield transition-colors duration-200 flex relative items-center rounded-lg px-1 py-1': true,
    'w-full': fullWidth,
    'primary border-secondary text-secondary': variant === 'primary',
    'secondary border-primary text-primary': variant === 'secondary',
  });

  const labelClasses = clx({
    'text-xs absolute top-[-10px] left-[22px] transition-colors duration-200': true,
    'text-secondary bg-primary': variant === 'primary',
    'text-primary bg-secondary': variant === 'secondary',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (onChange) onChange(e);
  };

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick(value);
    }
  };

  return (
    <div className={inputClasses}>
      <div className="flex grow items-start pl-4">
        {isLoading && <CircularProgress color="secondary" size={18} />}
        {LeadingIcon && !isLoading && LeadingIcon}
        <input
          required={required}
          maxLength={maxLength ? maxLength : 9999}
          disabled={isLoading}
          type={type || 'text'}
          className="ml-2 text-sm font-secondary font-bold grow"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
        />
      </div>
      <span className={labelClasses}>
        {label}
      </span>
      {buttonLabel &&
        <Button
          type={buttonType}
          disabled={isLoading || buttonDisabled}
          variant={variant}
          id={buttonId}
          onClick={handleButtonClick}
        >
          {buttonLabel}
        </Button>
      }
    </div>
  );
};

export default Textfield;
