import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppSession } from '../../../shared/session/AppSessionContext';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

const DashboardLayout = ({ children, activePath }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user, shop } = useAppSession();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-(--color-background)">
      <Sidebar
        activePath={activePath}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        shopName={shop?.name}
        onLogout={() => {
          void handleLogout();
        }}
      />
      <div className={`md:ml-24 transition-all duration-300 ${isSidebarOpen ? 'md:opacity-100 opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <Header 
          userName={user?.name}
          userEmail={user?.email}
          shopName={shop?.name}
          notificationCount={1}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="p-4 md:p-6 lg:p-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
