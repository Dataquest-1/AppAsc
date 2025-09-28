'use client';

import { useQuery } from '@tanstack/react-query';
import { clientesAPI } from '@/lib/api';

interface ClienteFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function ClienteFilter({ value, onChange }: ClienteFilterProps) {
  const { data: clientes, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clientesAPI.getAll(),
  });

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="cliente-filter" className="text-sm font-medium text-gray-700">
        Cliente:
      </label>
      <select
        id="cliente-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input w-auto min-w-[200px]"
        disabled={isLoading}
      >
        <option value="">Todos los clientes</option>
        {clientes?.map((cliente: any) => (
          <option key={cliente.id} value={cliente.id}>
            {cliente.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
