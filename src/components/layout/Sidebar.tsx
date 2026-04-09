import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Plus, Package, LogOut, X } from 'lucide-react';

interface SidebarProps {
  activePath?: string;
  isOpen?: boolean;
  onClose?: () => void;
  shopName?: string;
  onLogout?: () => void;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  activePath = '/dashboard',
  isOpen = false,
  onClose = () => {},
  shopName = 'Kukuza',
  onLogout = () => {}
}) => {
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      icon: <LayoutDashboard size={20} />,
      label: 'dashboard',
      path: '/dashboard'
    },
    {
      icon: <ShoppingBag size={20} />,
      label: 'Mes Ventes',
      path: '/ventes'
    },
    {
      icon: <Plus size={20} />,
      label: 'Ajouter produit',
      path: '/produits/ajouter'
    },
    {
      icon: <Package size={20} />,
      label: 'Mes Produit',
      path: '/produits'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const shopInitials = shopName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'KK';

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] transition-opacity duration-300 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed left-0 top-0 z-50 flex h-screen w-[18rem] max-w-[85vw] flex-col border-r border-(--color-border) bg-white py-5 shadow-xl transition-transform duration-300 md:w-24 md:items-center md:py-6 md:shadow-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="mb-6 flex w-full items-start justify-between gap-3 px-4 md:mb-12 md:flex-col md:items-center md:justify-start md:px-2">
          <div className="flex min-w-0 items-center gap-3 md:w-full md:flex-col md:gap-2 md:px-1">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--color-primary)">
              <span className="text-center text-xs font-bold text-white">{shopInitials}</span>
            </div>
            <span className="line-clamp-2 text-sm font-semibold leading-tight text-(--color-text-primary) md:max-w-[80px] md:text-center md:text-2xs">
              {shopName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="icon-btn md:hidden"
            title="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 md:w-full md:px-0">
          <ul className="space-y-2 md:space-y-4">
            {navItems.map((item) => {
              const isActive = activePath === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors md:flex-col md:gap-2 md:rounded-none md:px-2 ${
                      isActive
                        ? 'text-(--color-primary) bg-(--color-primary-lightest)'
                        : 'text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-surface-hover)'
                    }`}
                    title={item.label}
                  >
                    <span className={`shrink-0 ${isActive ? 'text-(--color-primary)' : ''}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium leading-tight md:max-w-[80px] md:text-center md:text-2xs">
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          onClick={onLogout}
          className="mx-3 mt-4 flex items-center gap-3 rounded-2xl px-4 py-3 text-(--color-text-secondary) transition-colors hover:bg-red-50 hover:text-(--color-error) md:mx-0 md:w-full md:flex-col md:justify-center md:gap-2 md:rounded-lg md:px-2"
          title="Déconnexion"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium md:hidden">Deconnexion</span>
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
