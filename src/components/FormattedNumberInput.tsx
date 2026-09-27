import React, { useState, useEffect } from 'react';

interface FormattedNumberInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  suffix?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export const formatWithDots = (num: number | string): string => {
  if (num === '' || num === null || num === undefined) return '';
  const clean = typeof num === 'number' ? num : Number(String(num).replace(/\D/g, ''));
  if (isNaN(clean)) return '';
  return clean.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseWithoutDots = (str: string): number => {
  const clean = str.replace(/\D/g, '');
  return clean ? parseInt(clean, 10) : 0;
};

export const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  className = '',
  suffix,
  disabled = false,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(formatWithDots(value));

  useEffect(() => {
    setDisplayValue(formatWithDots(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    const num = parseWithoutDots(rawInput);
    setDisplayValue(formatWithDots(num));
    onChange(num);
  };

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        inputMode="numeric"
        disabled={disabled}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full font-mono font-medium tabular-nums ${className} ${suffix ? 'pr-14' : ''}`}
      />
      {suffix && (
        <span className="absolute right-2.5 text-xs text-slate-500 font-medium pointer-events-none select-none">
          {suffix}
        </span>
      )}
    </div>
  );
};
