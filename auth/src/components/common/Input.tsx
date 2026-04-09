import React, { InputHTMLAttributes, ReactNode, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  label?: ReactNode;
  className?: string;
}

export const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
  label,
  className = '',
  ...props
}: InputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const baseClasses = 'auth-input';
  const errorClasses = 'ring-2 ring-red-500 focus:ring-red-500 border-red-500';
  const hasError = error && touched;
  const isPasswordField = type === 'password';
  const inputType = isPasswordField && isPasswordVisible ? 'text' : type;
  
  return (
    <div className="space-y-0.5 xs:space-y-1 sm:space-y-1.5">
      {label && (
        <label htmlFor={name} className={`block text-[0.688rem] xs:text-xs sm:text-sm font-medium ${hasError ? 'text-red-400' : 'text-white/80'}`}>
          {hasError ? error : label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={hasError ? '' : placeholder}
          className={`${baseClasses} ${hasError ? errorClasses : ''} ${isPasswordField ? 'pr-24' : ''} ${className}`}
          {...props}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-xs sm:text-sm text-black/70 hover:text-black transition-colors"
            aria-label={isPasswordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {isPasswordVisible ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3l18 18M10.58 10.58a2 2 0 102.83 2.83M9.88 5.09A9.77 9.77 0 0112 4.8c5.05 0 9.27 3.11 10.5 7.2a11.8 11.8 0 01-4.04 5.56M6.1 6.1A11.77 11.77 0 001.5 12c.7 2.32 2.33 4.32 4.6 5.63A9.77 9.77 0 0012 19.2c1.44 0 2.81-.3 4.06-.84"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.46 12C3.73 7.94 7.95 4.8 12 4.8s8.27 3.14 9.54 7.2c-1.27 4.06-5.49 7.2-9.54 7.2S3.73 16.06 2.46 12z"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
