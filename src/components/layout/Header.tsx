import React, { useEffect, useRef, useState } from 'react';
import { Bell, User, Menu, X } from 'lucide-react';
import logo from '../../assets/logo.png';
import NotificationsModal from '../common/NotificationsModal';

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  shopName?: string;
  notificationCount?: number;
  onMenuClick?: () => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  userName = 'Utilisateur',
  userEmail = 'email@kukuza.app',
  shopName,
  notificationCount = 0,
  onMenuClick = () => {},
  onLogout = () => {}
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isProfileOpen]);

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
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`icon-btn relative transition-all ${
              isNotificationsOpen
                ? 'bg-(--color-primary-lightest) text-(--color-primary)'
                : ''
            }`}
            title="Notifications"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-(--color-error) text-2xs font-semibold text-white ring-2 ring-white">
                {notificationCount}
              </span>
            )}
          </button>

          <NotificationsModal
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="hidden sm:flex items-center gap-3 hover:bg-(--color-surface-hover) rounded-lg px-3 py-2 transition-colors"
          >
            <div className="w-8 md:w-10 h-8 md:h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
              <User size={16} className="text-(--color-text-secondary)" />
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs md:text-sm font-semibold text-(--color-text-primary) truncate">
                {shopName || userName}
              </div>
              <div className="text-2xs text-(--color-text-secondary) truncate">
                {shopName ? userName : 'Cliquer pour détails'}
              </div>
            </div>
          </button>

          {isProfileOpen && (
            <div
              ref={profileRef}
              className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-(--color-border) bg-white shadow-xl"
            >
              <div className="relative border-b border-(--color-border) px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-(--color-text-primary)">Détails du profil</p>
                    <p className="text-2xs text-(--color-text-secondary)">Informations de la boutique</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="icon-btn"
                    title="Fermer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-3 p-4 text-sm text-(--color-text-primary)">
                <div>
                  <p className="text-2xs uppercase tracking-wide text-(--color-text-secondary)">Nom</p>
                  <p className="mt-1 font-medium truncate">{shopName || userName}</p>
                </div>
                <div>
                  <p className="text-2xs uppercase tracking-wide text-(--color-text-secondary)">Email</p>
                  <p className="mt-1 font-medium truncate">{userEmail}</p>
                </div>
                {shopName && (
                  <div>
                    <p className="text-2xs uppercase tracking-wide text-(--color-text-secondary)">Boutique</p>
                    <p className="mt-1 font-medium truncate">{shopName}</p>
                  </div>
                )}
              </div>
              <div className="border-t border-(--color-border) px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          className="sm:hidden icon-btn"
          type="button"
          onClick={() => setIsProfileOpen((prev) => !prev)}
        >
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User size={16} className="text-(--color-text-secondary)" />
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
