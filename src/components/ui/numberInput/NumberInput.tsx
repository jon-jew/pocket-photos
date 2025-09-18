'use client';

import React, { InputHTMLAttributes } from 'react';

import './numberInput.scss';

interface SingleDigitInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const SingleDigitInput: React.FC<SingleDigitInputProps> = ({ value, onChange, ...rest }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.replace(/\D/g, ''));
  };

  return (
    <input
      type="text"
      className="number-input"
      inputMode="numeric"
      maxLength={6}
      value={value}
      onChange={handleChange}
      {...rest}
    />
  );
};

export default SingleDigitInput;