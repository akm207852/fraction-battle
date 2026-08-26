import React from 'react';

interface FractionDisplayProps {
  numerator: number;
  denominator: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  dark?: boolean;
}

export const FractionDisplay: React.FC<FractionDisplayProps> = ({
  numerator,
  denominator,
  size = 'md',
  className = '',
  dark = false,
}) => {
  const sizeStyles = {
    xs: {
      text: 'text-[11px] sm:text-xs font-black tracking-tight',
      line: 'w-full max-w-[16px] h-[1.5px] my-[1.5px]',
      padding: 'py-0.5 px-0.5',
    },
    sm: {
      text: 'text-xs sm:text-sm font-black tracking-tight',
      line: 'w-full max-w-[20px] h-[2px] my-[2px]',
      padding: 'py-0.5 px-1',
    },
    md: {
      text: 'text-sm sm:text-base md:text-lg font-black tracking-tight',
      line: 'w-full max-w-[28px] h-[2.5px] my-[2px]',
      padding: 'py-1 px-1.5',
    },
    lg: {
      text: 'text-xl sm:text-2xl font-black tracking-tight',
      line: 'w-full max-w-[42px] h-[3px] my-[3px]',
      padding: 'py-1.5 px-2',
    },
    xl: {
      text: 'text-3xl sm:text-4xl font-black tracking-tight',
      line: 'w-full max-w-[58px] h-[4px] my-[4px]',
      padding: 'py-2 px-3',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      className={`inline-flex flex-col items-center justify-center font-mono tabular-nums leading-none select-none ${currentSize.padding} ${className}`}
    >
      <span
        className={`${currentSize.text} text-center ${
          dark ? 'text-white' : 'text-slate-900'
        }`}
      >
        {numerator}
      </span>
      <div
        className={`${currentSize.line} rounded-full ${
          dark ? 'bg-white/95' : 'bg-slate-900'
        }`}
      />
      <span
        className={`${currentSize.text} text-center ${
          dark ? 'text-white' : 'text-slate-900'
        }`}
      >
        {denominator}
      </span>
    </div>
  );
};

