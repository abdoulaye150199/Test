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
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Desktop Fixed */}
      <aside className={`fixed left-0 top-0 h-screen w-24 md:w-24 bg-white border-r border-(--color-border) flex flex-col items-center py-6 z-50 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="mb-8 md:mb-12 flex items-center justify-between w-full px-2">
          <div className="w-full flex flex-col items-center gap-2 px-1">
            <div className="w-12 h-12 bg-(--color-primary) rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold text-center">{shopInitials}</span>
            </div>
            <span className="text-2xs text-center font-semibold text-(--color-text-primary) leading-tight">
              {shopName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-(--color-text-secondary) hover:text-(--color-text-primary)"
            title="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 w-full">
          <ul className="space-y-4">
            {navItems.map((item) => {
              const isActive = activePath === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex flex-col items-center gap-2 py-3 px-2 transition-colors ${
                      isActive
                        ? 'text-(--color-primary) bg-(--color-primary-lightest)'
                        : 'text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-surface-hover)'
                    }`}
                    title={item.label}
                  >
                    <span className={isActive ? 'text-(--color-primary)' : ''}>
                      {item.icon}
                    </span>
                    <span className="text-2xs text-center font-medium break-words max-w-[80px] leading-tight">
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex flex-col items-center gap-2 py-3 px-2 text-(--color-text-secondary) hover:text-(--color-error) hover:bg-red-50 transition-colors rounded-lg"
          title="Déconnexion"
        >
          <LogOut size={20} />
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
