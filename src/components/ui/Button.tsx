import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'outline' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export default function Button({
  children,
  className = '',
  variant = 'gold',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    gold: 'bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-[#060b13] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:brightness-110 border border-transparent',
    outline: 'border border-[#d4af37] text-[#d4af37] bg-transparent hover:bg-[#d4af37]/10 hover:shadow-[0_0_10px_rgba(212,175,55,0.2)]',
    secondary: 'bg-[#1c2541] text-[#f3f4f6] hover:bg-[#2e3b5e] border border-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 border border-transparent',
    ghost: 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5 border border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
