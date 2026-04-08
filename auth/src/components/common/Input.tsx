import React, { InputHTMLAttributes, ReactNode } from 'react';

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
  const baseClasses = 'auth-input';
  const errorClasses = 'ring-2 ring-red-500 focus:ring-red-500 border-red-500';
  const hasError = error && touched;
  
  return (
    <div className="space-y-0.5 xs:space-y-1 sm:space-y-1.5">
      {label && (
        <label htmlFor={name} className={`block text-[0.688rem] xs:text-xs sm:text-sm font-medium ${hasError ? 'text-red-400' : 'text-white/80'}`}>
          {hasError ? error : label}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={hasError ? '' : placeholder}
        className={`${baseClasses} ${hasError ? errorClasses : ''} ${className}`}
        {...props}
      />
    </div>
  );
};