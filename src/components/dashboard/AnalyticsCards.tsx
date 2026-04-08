import React from 'react';
import StatCard from '../common/StatCard';
import { LineChart, Banknote, ShoppingBag, Users } from 'lucide-react';
import type { DashboardStats } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface AnalyticsCardsProps {
  stats: DashboardStats;
}

const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({ stats }) => {
  return (
    <div>
      <h2 className="text-lg md:text-xl font-semibold text-(--color-text-primary) mb-4 md:mb-6">
        Analyses
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={<LineChart size={24} style={{ color: '#287460' }} />}
          iconBgColor="bg-green-100"
          label="Revenu total"
          value={formatCurrency(stats.totalRevenue)}
          change={stats.revenueChange}
        />
        <StatCard
          icon={<Banknote size={24} style={{ color: '#287460' }} />}
          iconBgColor="bg-green-100"
          label="Revenu du jour"
          value={formatCurrency(stats.dailyRevenue)}
          change={stats.dailyRevenueChange}
        />
        <StatCard
          icon={<ShoppingBag size={24} style={{ color: '#287460' }} />}
          iconBgColor="bg-green-100"
          label="Vendus"
          value={stats.totalSales}
        />
        <StatCard
          icon={<Users size={24} style={{ color: '#287460' }} />}
          iconBgColor="bg-green-100"
          label="Utilisateurs actifs"
          value={stats.activeUsers}
        />
      </div>
    </div>
  );
};

export default AnalyticsCards;
