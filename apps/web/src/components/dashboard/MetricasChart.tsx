'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatDate } from '@/lib/utils';

interface MetricasDiariasData {
  fecha: string;
  mantenimientos: number;
  reparaciones: number;
  emergencias: number;
}

interface MetricasChartProps {
  data: MetricasDiariasData[];
}

export function MetricasChart({ data }: MetricasChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No hay datos disponibles para el período seleccionado
      </div>
    );
  }

  const formattedData = data.map(item => ({
    ...item,
    fechaFormatted: formatDate(item.fecha, 'short'),
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="fechaFormatted" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelFormatter={(value) => `Fecha: ${value}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="mantenimientos"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Mantenimientos"
          />
          <Line
            type="monotone"
            dataKey="reparaciones"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Reparaciones"
          />
          <Line
            type="monotone"
            dataKey="emergencias"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Emergencias"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
