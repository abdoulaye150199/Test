import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isSidebarOpen]);

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
      <div className="min-h-screen min-w-0 md:ml-24">
        <Header 
          userName={user?.name}
          userEmail={user?.email}
          shopName={shop?.name}
          notificationCount={1}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={() => void handleLogout()}
        />
        <main className="min-h-[calc(100vh-4rem)] overflow-x-hidden p-4 md:min-h-[calc(100vh-5rem)] md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
