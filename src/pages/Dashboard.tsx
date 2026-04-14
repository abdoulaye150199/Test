import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import AnalyticsSection from '../components/common/AnalyticsSection';
import SalesChart from '../components/dashboard/SalesChart';
import VisitsChart from '../components/dashboard/VisitsChart';
import ProductsTable from '../components/dashboard/ProductsTable';
import { useDashboardData } from '../hooks/useDashboardData';
import { useProducts } from '../hooks/useProducts';

const DashboardPage: React.FC = () => {
  const {
    stats,
    salesData,
    visitsData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useDashboardData();
  const {
    products,
    isLoading: isProductsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts();

  if (isDashboardLoading || isProductsLoading) {
    return (
      <DashboardLayout activePath="/dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-(--color-text-secondary)">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if ((dashboardError && !stats) || (productsError && products.length === 0)) {
    return (
      <DashboardLayout activePath="/dashboard">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Certaines donnees du dashboard ne sont pas disponibles pour le moment.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePath="/dashboard">
      <div className="space-y-6 md:space-y-8">
        <AnalyticsSection
          stats={stats}
          isLoading={isDashboardLoading}
          error={dashboardError}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-3">
          <div className="min-w-0 md:col-span-2 lg:col-span-2">
            <SalesChart data={salesData} />
          </div>
          <div className="min-w-0 md:col-span-1 lg:col-span-1">
            <VisitsChart data={visitsData} />
          </div>
        </div>

        <div className="min-w-0 overflow-hidden">
          <ProductsTable products={products} onProductsChange={refetchProducts} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
