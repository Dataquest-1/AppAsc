'use client';

import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface CotizacionAbierta {
  id: string;
  numero: string;
  titulo: string;
  cliente: {
    nombre: string;
  };
  activo: {
    codigo: string;
    nombre: string;
  };
  estado: string;
  total: number;
  createdAt: string;
  diasAbierta: number;
}

interface CotizacionesAbiertasTableProps {
  data: CotizacionAbierta[];
}

export function CotizacionesAbiertasTable({ data }: CotizacionesAbiertasTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay cotizaciones abiertas</h3>
        <p className="mt-1 text-sm text-gray-500">
          Todas las cotizaciones han sido cerradas.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <table className="table">
        <thead className="table-header">
          <tr>
            <th className="table-header-cell">Cotización</th>
            <th className="table-header-cell">Cliente / Activo</th>
            <th className="table-header-cell">Estado</th>
            <th className="table-header-cell">Total</th>
            <th className="table-header-cell">Días Abierta</th>
          </tr>
        </thead>
        <tbody className="table-body">
          {data.map((cotizacion) => (
            <tr key={cotizacion.id} className="table-row">
              <td className="table-cell">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {cotizacion.numero}
                  </div>
                  <div className="text-sm text-gray-500">
                    {cotizacion.titulo}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(cotizacion.createdAt)}
                  </div>
                </div>
              </td>
              <td className="table-cell">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {cotizacion.cliente.nombre}
                  </div>
                  <div className="text-sm text-gray-500">
                    {cotizacion.activo.codigo} - {cotizacion.activo.nombre}
                  </div>
                </div>
              </td>
              <td className="table-cell">
                <span className={`badge ${getStatusColor(cotizacion.estado)}`}>
                  {cotizacion.estado.replace('_', ' ')}
                </span>
              </td>
              <td className="table-cell">
                <div className="text-sm font-medium text-gray-900">
                  {cotizacion.total > 0 ? formatCurrency(cotizacion.total) : 'Sin precio'}
                </div>
              </td>
              <td className="table-cell">
                <div className="flex items-center">
                  <span
                    className={`badge ${
                      cotizacion.diasAbierta > 30
                        ? 'badge-danger'
                        : cotizacion.diasAbierta > 15
                        ? 'badge-warning'
                        : 'badge-success'
                    }`}
                  >
                    {cotizacion.diasAbierta} días
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
