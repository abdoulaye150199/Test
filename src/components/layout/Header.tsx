import React, { useState } from 'react';
import { Bell, User, Menu } from 'lucide-react';
import logo from '../../assets/logo.png';
import NotificationsModal from '../common/NotificationsModal';

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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-(--color-border) bg-white/95 px-3 backdrop-blur md:h-20 md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="icon-btn shrink-0 md:hidden"
          title="Menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex min-w-0 items-center gap-3">
          <img 
            src={logo} 
            alt="Kukuza" 
            className="h-8 object-contain md:h-10"
          />
          <div className="min-w-0 sm:hidden">
            <div className="truncate text-sm font-semibold text-(--color-text-primary)">
              {shopName || userName}
            </div>
            <div className="truncate text-2xs text-(--color-text-secondary)">
              {userEmail}
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4 md:gap-6">
        <button 
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className="icon-btn relative" 
          title="Notifications"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-(--color-error) text-2xs font-semibold text-white">
              {notificationCount}
            </span>
          )}
        </button>

        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />

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
