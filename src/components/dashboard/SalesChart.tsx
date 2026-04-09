import React, { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Card from '../common/Card';
import type { ChartDataPoint } from '../../types';

interface SalesChartProps {
  data: ChartDataPoint[];
  title?: string;
}

type TimeFilter = 'Jour' | 'Semaine' | 'Mois' | 'Année';

const SalesChart: React.FC<SalesChartProps> = ({ data, title = 'Rapport' }) => {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('Semaine');
  const [activeCategory, setActiveCategory] = useState<string>('Ventes');

  const filters: TimeFilter[] = ['Jour', 'Semaine', 'Mois', 'Année'];

  return (
    <Card>
      <div className="mb-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <h3 className="text-lg font-semibold text-(--color-text-primary)">
              {title}
            </h3>
            <select 
              className="w-full rounded-md border border-(--color-border) bg-white px-3 py-2 text-sm text-(--color-text-secondary) focus:outline-none focus:ring-2 focus:ring-(--color-primary) sm:w-auto"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              <option value="Ventes">Ventes</option>
              <option value="Revenus">Revenus</option>
              <option value="Commandes">Commandes</option>
            </select>
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hidden">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors sm:px-4 ${
                  activeFilter === filter
                    ? 'bg-(--color-primary) text-white'
                    : 'text-(--color-text-secondary) hover:bg-(--color-surface-hover)'
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[260px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#90EE90" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#90EE90" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="label" 
              stroke="#6b7280" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280" 
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ventes']}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#287460" 
              strokeWidth={2}
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default SalesChart;
