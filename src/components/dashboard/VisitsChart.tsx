import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';
import type { VisitsData } from '../../types';

interface VisitsChartProps {
  data: VisitsData[];
  title?: string;
}

const VisitsChart: React.FC<VisitsChartProps> = ({ data, title = 'Visites' }) => {
  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-(--color-text-primary)">
          {title}
        </h3>
      </div>

      <div className="h-[240px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="day" 
            stroke="#6b7280" 
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280" 
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number) => [value, 'Visites']}
          />
          <Bar 
            dataKey="visits" 
            fill="#90EE90" 
            radius={[8, 8, 0, 0]}
          />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default VisitsChart;
