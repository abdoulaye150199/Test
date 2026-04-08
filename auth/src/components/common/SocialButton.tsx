import React, { ButtonHTMLAttributes, ComponentType } from 'react';

interface SocialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: 'google' | 'apple';
  icon: ComponentType<{ className?: string }>;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export const SocialButton = ({
  provider,
  icon: Icon,
  onClick,
  className = '',
  ...props
}: SocialButtonProps) => {
  const baseClasses = 'social-button focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900';
  
  const providerStyles: Record<'google' | 'apple', string> = {
    google: 'bg-white/10 backdrop-blur-md border-1 border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30 focus:ring-white/50',
    apple: 'bg-white/10 backdrop-blur-md border-1 border-white/20 text-gray-300 hover:bg-white/20 hover:border-white/30 focus:ring-white/50',
  };

  const providerText: Record<'google' | 'apple', string> = {
    google: 'Continuer avec Google',
    apple: 'Continuer avec Apple',
  };

  return (
    <button
      type="button"
      className={`${baseClasses} ${providerStyles[provider]} ${className}`}
      onClick={onClick}
      {...props}
    >
      <Icon className="w-6 h-6" />
      <span className="text-base">
        {providerText[provider]}
      </span>
    </button>
  );
};