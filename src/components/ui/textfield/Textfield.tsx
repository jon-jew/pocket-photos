import React, { useState } from 'react';

import Button from '@/components/ui/button';

import './textfield.scss';

interface TextfieldProps {
  intialValue?: any;
  placeholder?: string;
  buttonLabel?: string;
  label?: string;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  required?: boolean;
  LeadingIcon?: React.ReactNode;
  onButtonClick?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Textfield: React.FC<TextfieldProps> = ({
  intialValue,
  placeholder,
  buttonLabel,
  label,
  variant = 'primary',
  fullWidth = false,
  required = false,
  LeadingIcon,
  onChange,
  onButtonClick,
}) => {
  const baseStyle = "textfield flex relative items-center rounded-lg px-1 py-1 space-x-2";
  const variantStyle =
    variant === 'primary'
      ? 'border-secondary text-secondary'
      : 'border-primary text-primary';
  
  const labelBaseStyle = "text-xs absolute top-[-10px] left-[22px]"
  const labelVariantStyle =
    variant === 'primary'
      ? 'text-secondary bg-primary'
      : 'text-primary bg-secondary';

  const [value, setValue] = useState(intialValue || '');

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
    <div className={`${baseStyle} ${variantStyle} ${fullWidth ? 'w-full' : ''}`}>
      <div className="flex grow items-start pl-4">
        {LeadingIcon && LeadingIcon}
        <input
          required={required}
          className="ml-2 text-sm font-secondary font-bold grow"
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
        />
      </div>
      <span className={`${labelBaseStyle} ${labelVariantStyle}`}>
        {label}
      </span>
      {buttonLabel &&
        <Button
          type="button"
          variant={variant}
          onClick={handleButtonClick}
        >
          {buttonLabel}
        </Button>
      }
    </div>
  );
};

export default Textfield;
