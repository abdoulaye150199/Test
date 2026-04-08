import { useEffect, useState } from 'react';
import type { SaleItem, SaleStatus } from '../types';
import { shopService } from '../services/shop/shopService';

interface UseSalesReturn {
  sales: SaleItem[];
  filteredSales: SaleItem[];
  isLoading: boolean;
  error: Error | null;
  filter: SaleStatus | 'all';
  setFilter: (filter: SaleStatus | 'all') => void;
  refetch: () => Promise<void>;
}

export const useSales = (): UseSalesReturn => {
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<SaleStatus | 'all'>('all');

  const fetchSales = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await shopService.getSales();
      setSales(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Impossible de charger les ventes.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchSales();
  }, []);

  const filteredSales = sales.filter((sale) => filter === 'all' || sale.status === filter);

  return {
    sales,
    filteredSales,
    isLoading,
    error,
    filter,
    setFilter,
    refetch: fetchSales,
  };
};
