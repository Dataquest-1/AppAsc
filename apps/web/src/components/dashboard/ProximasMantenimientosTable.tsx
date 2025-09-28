'use client';

import { formatDate, getStatusColor } from '@/lib/utils';
import { ClockIcon } from '@heroicons/react/24/outline';

interface ProximoMantenimiento {
  id: string;
  activo: {
    codigo: string;
    nombre: string;
    cliente: {
      nombre: string;
    };
  };
  planMantenimiento: {
    nombre: string;
    periodicidad: string;
  };
  fechaProgramada: string;
  prioridad: string;
  diasRestantes: number;
}

interface ProximasMantenimientosTableProps {
  data: ProximoMantenimiento[];
}

export function ProximasMantenimientosTable({ data }: ProximasMantenimientosTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay mantenimientos próximos</h3>
        <p className="mt-1 text-sm text-gray-500">
          No hay mantenimientos programados para el próximo mes.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <table className="table">
        <thead className="table-header">
          <tr>
            <th className="table-header-cell">Activo</th>
            <th className="table-header-cell">Plan</th>
            <th className="table-header-cell">Fecha</th>
            <th className="table-header-cell">Días Restantes</th>
          </tr>
        </thead>
        <tbody className="table-body">
          {data.map((mantenimiento) => (
            <tr key={mantenimiento.id} className="table-row">
              <td className="table-cell">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {mantenimiento.activo.codigo}
                  </div>
                  <div className="text-sm text-gray-500">
                    {mantenimiento.activo.nombre}
                  </div>
                  <div className="text-xs text-gray-400">
                    {mantenimiento.activo.cliente.nombre}
                  </div>
                </div>
              </td>
              <td className="table-cell">
                <div>
                  <div className="text-sm text-gray-900">
                    {mantenimiento.planMantenimiento.nombre}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {mantenimiento.planMantenimiento.periodicidad}
                  </div>
                </div>
              </td>
              <td className="table-cell">
                <div className="text-sm text-gray-900">
                  {formatDate(mantenimiento.fechaProgramada)}
                </div>
              </td>
              <td className="table-cell">
                <div className="flex items-center">
                  <span
                    className={`badge ${
                      mantenimiento.diasRestantes <= 3
                        ? 'badge-danger'
                        : mantenimiento.diasRestantes <= 7
                        ? 'badge-warning'
                        : 'badge-success'
                    }`}
                  >
                    {mantenimiento.diasRestantes} días
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
