import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSession } from '../shared/session/AppSessionContext';
import DashboardPage from './pages/Dashboard';
import SalesPage from './pages/Sales';
import ProductsPage from './pages/Products';
import AddProductPage from './pages/AddProduct';
import { LoginPage } from '../auth/src/views/Login';
import { RegisterPage } from '../auth/src/views/Register';
import { BoutiqueRegisterPage } from '../auth/src/views/BoutiqueRegister';

const ShopRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, shop } = useAppSession();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!shop) {
    return <Navigate to="/register/boutique" replace />;
  }

  return children;
};

const GuestRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, shop } = useAppSession();

  if (isAuthenticated) {
    return <Navigate to={shop ? '/dashboard' : '/register/boutique'} replace />;
  }

  return children;
};

const BoutiqueSetupRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, shop } = useAppSession();

  if (isAuthenticated && shop) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const RootRedirect: React.FC = () => {
  const { isAuthenticated, shop } = useAppSession();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={shop ? '/dashboard' : '/register/boutique'} replace />;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/register/boutique" element={<BoutiqueSetupRoute><BoutiqueRegisterPage /></BoutiqueSetupRoute>} />
      <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
      <Route path="/dashboard" element={<ShopRoute><DashboardPage /></ShopRoute>} />
      <Route path="/ventes" element={<ShopRoute><SalesPage /></ShopRoute>} />
      <Route path="/produits" element={<ShopRoute><ProductsPage /></ShopRoute>} />
      <Route path="/produits/ajouter" element={<ShopRoute><AddProductPage /></ShopRoute>} />
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};

export default App;
