import React, { ImgHTMLAttributes } from 'react';
import logoSrc from '../../assets/logo.png';

interface KukuzaLogoProps {
  className?: string;
}

export const KukuzaLogo = ({ className = 'w-full h-auto' }: KukuzaLogoProps) => (
  <div className={`kukuza-logo-img ${className}`} aria-hidden="true">
    <img src={logoSrc} alt="Kukuza" style={{ width: '100%', height: 'auto', display: 'block' }} />
  </div>
);