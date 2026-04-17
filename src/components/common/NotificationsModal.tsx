import React, { useEffect, useRef } from 'react';
import {
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';

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

const getNotificationMeta = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return {
        icon: <CheckCircle size={16} className="text-(--color-success)" />,
        iconWrapperClass: 'bg-emerald-50',
      };
    case 'warning':
      return {
        icon: <AlertCircle size={16} className="text-(--color-warning)" />,
        iconWrapperClass: 'bg-amber-50',
      };
    case 'info':
    default:
      return {
        icon: <Info size={16} className="text-(--color-info)" />,
        iconWrapperClass: 'bg-blue-50',
      };
  }
};

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
    <div
      ref={modalRef}
      className="animate-fade-in absolute right-0 top-full z-50 mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-(--color-border) bg-white shadow-xl"
      role="dialog"
      aria-label="Notifications"
    >
      <div className="absolute -top-1 right-5 h-3 w-3 rotate-45 border-l border-t border-(--color-border) bg-white" />

      <div className="relative border-b border-(--color-border) px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-(--color-text-primary)">Notifications</h2>
            <p className="mt-0.5 text-xs text-(--color-text-secondary)">
              {unreadCount > 0
                ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
                : 'Aucune notification non lue'}
            </p>
          </div>

          <button onClick={onClose} className="icon-btn h-8 w-8 shrink-0" title="Fermer">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto py-2">
        {notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-(--color-secondary) text-(--color-text-tertiary)">
              <Info size={18} />
            </div>
            <p className="mt-3 text-sm font-medium text-(--color-text-primary)">Aucune notification</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => {
              const meta = getNotificationMeta(notification.type);

              return (
                <button
                  key={notification.id}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-(--color-surface-hover) ${
                    !notification.read ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.iconWrapperClass}`}
                  >
                    {meta.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-(--color-text-primary)">
                          {notification.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-(--color-text-secondary)">
                          {notification.message}
                        </p>
                      </div>

                      {!notification.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-(--color-primary)" />
                      )}
                    </div>

                    <p className="mt-1 text-[11px] text-(--color-text-tertiary)">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="border-t border-(--color-border) p-2">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-(--color-primary) transition-colors hover:bg-(--color-primary-lightest)">
            Voir toutes les notifications
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsModal;
