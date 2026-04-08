import { useState, useEffect } from 'react';
import type { DashboardStats, ChartDataPoint, VisitsData } from '../types';
import { shopService } from '../services/shop/shopService';

interface UseDashboardDataReturn {
  stats: DashboardStats | null;
  salesData: ChartDataPoint[];
  visitsData: VisitsData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useDashboardData = (): UseDashboardDataReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<ChartDataPoint[]>([]);
  const [visitsData, setVisitsData] = useState<VisitsData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await shopService.getDashboardOverview();
      setStats(data.stats);
      setSalesData(data.salesData);
      setVisitsData(data.visitsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Impossible de charger le dashboard.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  return {
    stats,
    salesData,
    visitsData,
    isLoading,
    error,
    refetch: fetchData
  };
};
