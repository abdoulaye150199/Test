import React, { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  children?: ReactNode;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Button = ({
  type = 'button',
  variant = 'primary',
  children,
  className = '',
  loading = false,
  disabled = false,
  onClick,
  ...props
}: ButtonProps) => {
  const baseClasses = 'primary-button focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900';

  const variants = {
    primary: '',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary',
  };

  return (
    <button
      type={type}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${loading || disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={onClick}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
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
          Chargement...
        </div>
      ) : (
        children
      )}
    </button>
  );
};