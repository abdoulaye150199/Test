import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import AnalyticsSection from '../components/common/AnalyticsSection';
import ProductsTable from '../components/dashboard/ProductsTable';
import { useDashboardData } from '../hooks/useDashboardData';
import { useProducts } from '../hooks/useProducts';

const ProductsPage: React.FC = () => {
  const {
    stats,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useDashboardData();
  const {
    products,
    isLoading,
    error: productsError,
  } = useProducts();

  if (isLoading || isDashboardLoading) {
    return (
      <DashboardLayout activePath="/produits">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-(--color-text-secondary)">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if ((productsError && products.length === 0) || (dashboardError && !stats)) {
    return (
      <DashboardLayout activePath="/produits">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Impossible de charger les donnees produits pour le moment.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePath="/produits">
      <div className="space-y-6 md:space-y-8">
        <AnalyticsSection
          stats={stats}
          isLoading={isDashboardLoading}
          error={dashboardError}
        />

        <div className="overflow-hidden">
          <ProductsTable products={products} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;
