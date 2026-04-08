import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import AnalyticsSection from '../components/common/AnalyticsSection';
import Card from '../components/common/Card';
import Tabs, { Tab } from '../components/common/Tabs';
import Pagination from '../components/common/Pagination';
import { useDashboardData } from '../hooks/useDashboardData';
import { useSales } from '../hooks/useSales';
import type { SaleStatus } from '../types';
import { formatCurrency } from '../utils/formatters';

type StatusFilter = 'all' | SaleStatus;

const ITEMS_PER_PAGE = 6;

const SalesPage: React.FC = () => {
  const {
    stats,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useDashboardData();
  const {
    sales,
    isLoading: isSalesLoading,
    error: salesError,
  } = useSales();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const getStatusBadge = (status: SaleStatus) => {
    switch (status) {
      case 'completed':
        return <span className="badge-success">Complété</span>;
      case 'pending':
        return <span className="badge-warning">En attente</span>;
      case 'cancelled':
        return <span className="badge-error">Annulé</span>;
      default:
        return null;
    }
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
      const normalizedQuery = searchQuery.trim().toLowerCase();
      const matchesSearch =
        normalizedQuery === '' ||
        sale.reference.toLowerCase().includes(normalizedQuery) ||
        sale.productName.toLowerCase().includes(normalizedQuery) ||
        sale.customer.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });
  }, [sales, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredSales]);

  const statusCounts = {
    all: sales.length,
    completed: sales.filter((sale) => sale.status === 'completed').length,
    pending: sales.filter((sale) => sale.status === 'pending').length,
    cancelled: sales.filter((sale) => sale.status === 'cancelled').length,
  };

  const tabs: Tab[] = [
    { id: 'all', label: 'Toutes', count: statusCounts.all },
    { id: 'completed', label: 'Complétées', count: statusCounts.completed },
    { id: 'pending', label: 'En attente', count: statusCounts.pending },
    { id: 'cancelled', label: 'Annulées', count: statusCounts.cancelled },
  ];

  if (isDashboardLoading || isSalesLoading) {
    return (
      <DashboardLayout activePath="/ventes">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-(--color-text-secondary)">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if ((dashboardError && !stats) || (salesError && sales.length === 0)) {
    return (
      <DashboardLayout activePath="/ventes">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Impossible de charger les ventes pour le moment.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePath="/ventes">
      <div className="space-y-6 md:space-y-8">
        <AnalyticsSection
          stats={stats}
          isLoading={isDashboardLoading}
          error={dashboardError}
        />

        <Card>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-(--color-border) mb-6 pb-0 gap-4">
            <div className="flex-1 w-full md:w-auto">
              <Tabs
                tabs={tabs}
                activeTab={statusFilter}
                onTabChange={(tabId) => setStatusFilter(tabId as StatusFilter)}
              />
            </div>

            <div className="relative w-full md:w-80 mb-3">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-tertiary)"
              />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-(--color-border) rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-(--color-primary) focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-(--color-text-primary)">
              Historique des ventes ({filteredSales.length})
            </h2>
          </div>

          <div className="overflow-x-auto table-responsive">
            <table className="w-full">
              <thead>
                <tr className="border-b border-(--color-border)">
                  <th className="text-left py-3 px-2 md:px-4 text-sm font-semibold text-(--color-text-secondary)">
                    Référence
                  </th>
                  <th className="hidden sm:table-cell text-left py-3 px-2 md:px-4 text-sm font-semibold text-(--color-text-secondary)">
                    Produit
                  </th>
                  <th className="hidden md:table-cell text-left py-3 px-2 md:px-4 text-sm font-semibold text-(--color-text-secondary)">
                    Client
                  </th>
                  <th className="text-left py-3 px-2 md:px-4 text-sm font-semibold text-(--color-text-secondary)">
                    Qté
                  </th>
                  <th className="hidden md:table-cell text-left py-3 px-2 md:px-4 text-sm font-semibold text-(--color-text-secondary)">
                    Prix U.
                  </th>
                  <th className="text-left py-3 px-2 md:px-4 text-sm font-semibold text-(--color-text-secondary)">
                    Total
                  </th>
                  <th className="hidden lg:table-cell text-left py-3 px-2 md:px-4 text-sm font-semibold text-(--color-text-secondary)">
                    Date
                  </th>
                  <th className="text-left py-3 px-2 md:px-4 text-sm font-semibold text-(--color-text-secondary)">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedSales.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-(--color-text-secondary)">
                      {searchQuery ? 'Aucune vente trouvée pour votre recherche' : 'Aucune vente disponible'}
                    </td>
                  </tr>
                ) : (
                  paginatedSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-(--color-border) hover:bg-(--color-surface-hover)">
                      <td className="py-4 px-2 md:px-4 text-sm font-medium">{sale.reference}</td>
                      <td className="hidden sm:table-cell py-4 px-2 md:px-4 text-sm">{sale.productName}</td>
                      <td className="hidden md:table-cell py-4 px-2 md:px-4 text-sm">{sale.customer}</td>
                      <td className="py-4 px-2 md:px-4 text-sm">{sale.quantity}</td>
                      <td className="hidden md:table-cell py-4 px-2 md:px-4 text-sm">{formatCurrency(sale.unitPrice)}</td>
                      <td className="py-4 px-2 md:px-4 text-sm font-semibold">{formatCurrency(sale.totalPrice)}</td>
                      <td className="hidden lg:table-cell py-4 px-2 md:px-4 text-sm text-(--color-text-secondary)">
                        {formatDate(sale.date)}
                      </td>
                      <td className="py-4 px-2 md:px-4 text-sm">{getStatusBadge(sale.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredSales.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredSales.length}
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SalesPage;
