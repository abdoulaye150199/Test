import React from 'react';
import Card from './Card';

interface StatCardProps {
  icon: React.ReactNode;
  iconBgColor?: string;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  iconBgColor = 'bg-green-100',
  label, 
  value, 
  change,
  changeLabel = ''
}) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className="stat-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-sm text-(--color-text-secondary) mb-2">
            {label}
          </div>
          <div className="stat-card-value mb-2 break-words text-2xl font-bold text-(--color-text-primary) md:text-3xl">
            {value}
          </div>
          {change !== undefined && (
            <div className={`stat-card-change inline-flex w-fit ${isPositive ? 'positive' : isNegative ? 'negative' : ''}`}>
              {isPositive ? '+' : ''}{change}% {changeLabel}
            </div>
          )}
        </div>
        <div className={`stat-card-icon shrink-0 ${iconBgColor}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
