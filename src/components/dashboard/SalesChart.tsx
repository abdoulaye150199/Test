import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-(--color-text-primary)">
              {title}
            </h3>
            <select 
              className="text-sm px-3 py-1.5 border border-(--color-border) rounded-md bg-white text-(--color-text-secondary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              <option value="Ventes">Ventes</option>
              <option value="Revenus">Revenus</option>
              <option value="Commandes">Commandes</option>
            </select>
          </div>

          <div className="flex gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
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

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
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
    </Card>
  );
};

export default SalesChart;
