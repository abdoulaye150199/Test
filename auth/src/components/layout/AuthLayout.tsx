import React, { ReactNode } from 'react';
import { KukuzaLogo } from '../common/KukuzaLogo';
import { Link } from 'react-router-dom';
import HomeIcon from '../icons/HomeIcon';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="auth-container">
      {/* Home Button */}
      <Link to="/" className="home-button">
        <HomeIcon />
        <span className="hidden xs:inline">Accueil</span>
      </Link>

      {/* Decorative Kukuza logo placed on the left side of the layout - hidden on mobile and small tablets */}
      <div className="kukuza-logo" aria-hidden>
        <KukuzaLogo className="kukuza-logo-inner" />
      </div>

      <div className="auth-form-container">
        {children}
      </div>
    </div>
  );
};