import React from 'react';
import { Bell, User, Menu } from 'lucide-react';
import logo from '../../assets/logo.png';

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  shopName?: string;
  notificationCount?: number;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  userName = 'Utilisateur',
  userEmail = 'email@kukuza.app',
  shopName,
  notificationCount = 0,
  onMenuClick = () => {}
}) => {
  return (
    <header className="sticky top-0 h-16 md:h-20 bg-white border-b border-(--color-border) flex items-center justify-between px-4 md:px-8 z-50 gap-4">
      {/* Menu Button for Mobile */}
      <button 
        onClick={onMenuClick}
        className="md:hidden icon-btn"
        title="Menu"
      >
        <Menu size={20} />
      </button>

      {/* Logo */}
      <div className="flex items-center flex-shrink-0">
        <img 
          src={logo} 
          alt="Kukuza" 
          className="h-8 md:h-10 object-contain"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1 hidden sm:block" />

      {/* Right side - Notifications and User */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Notifications */}
        <button className="icon-btn relative" title="Notifications">
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-(--color-error) text-white text-2xs font-semibold rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User Profile - Hidden on mobile, visible on sm+ */}
        <button className="hidden sm:flex items-center gap-3 hover:bg-(--color-surface-hover) rounded-lg px-3 py-2 transition-colors">
          <div className="w-8 md:w-10 h-8 md:h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-(--color-text-secondary)" />
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs md:text-sm font-semibold text-(--color-text-primary) truncate">
              {shopName || userName}
            </div>
            <div className="text-2xs text-(--color-text-secondary) truncate">
              {shopName ? `${userName} · ${userEmail}` : userEmail}
            </div>
          </div>
        </button>

        {/* User Profile Icon Only - Visible on mobile */}
        <button className="sm:hidden icon-btn">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User size={16} className="text-(--color-text-secondary)" />
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
