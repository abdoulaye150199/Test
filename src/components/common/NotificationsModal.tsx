import React, { useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: Notification[];
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications = [
    {
      id: '1',
      type: 'success',
      title: 'Produit ajouté',
      message: 'Votre produit "Sac" a été ajouté avec succès',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'Vente effectuée',
      message: 'Vous avez reçu une nouvelle commande',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: '3',
      type: 'warning',
      title: 'Stock faible',
      message: 'Le stock de "Chaussures" est faible',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      read: true,
    },
  ],
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-500" />;
      case 'info':
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0 && minutes < 1) return 'À l\'instant';
    if (hours === 0) return `Il y a ${minutes}m`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)}j`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      
      <div
        ref={modalRef}
        className="fixed right-3 top-20 z-50 w-96 max-w-[calc(100vw-24px)] rounded-xl border border-(--color-border) bg-white shadow-xl md:right-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--color-border) p-4">
          <div>
            <h2 className="text-sm font-semibold text-(--color-text-primary)">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-2xs text-(--color-text-tertiary)">{unreadCount} non lue(s)</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="icon-btn shrink-0"
            title="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-center">
              <div>
                <Info size={32} className="mx-auto mb-2 text-(--color-text-tertiary)" />
                <p className="text-sm text-(--color-text-secondary)">Aucune notification</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-(--color-border)">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex gap-3 p-4 transition-colors hover:bg-(--color-surface-hover) cursor-pointer ${
                    !notification.read ? 'bg-(--color-secondary)' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className="shrink-0 pt-1">{getIcon(notification.type)}</div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-(--color-text-primary)">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="shrink-0 h-2 w-2 rounded-full bg-(--color-primary) mt-1" />
                      )}
                    </div>
                    <p className="text-2xs text-(--color-text-secondary) mt-1">
                      {notification.message}
                    </p>
                    <p className="text-2xs text-(--color-text-tertiary) mt-1">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-(--color-border) p-3 text-center">
            <button className="text-2xs font-medium text-(--color-primary) hover:underline">
              Voir toutes les notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationsModal;
