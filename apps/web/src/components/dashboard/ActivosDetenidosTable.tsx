'use client';

import { formatRelativeTime, getStatusColor } from '@/lib/utils';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ActivoDetenido {
  id: string;
  codigo: string;
  nombre: string;
  cliente: {
    nombre: string;
  };
  ubicacion: string;
  fechaDetencion: string;
  motivoDetencion: string;
  criticidad: string;
}

interface ActivosDetenidosTableProps {
  data: ActivoDetenido[];
}

export function ActivosDetenidosTable({ data }: ActivosDetenidosTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay activos detenidos</h3>
        <p className="mt-1 text-sm text-gray-500">
          Todos los activos están operativos.
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
            <th className="table-header-cell">Cliente</th>
            <th className="table-header-cell">Tiempo Detenido</th>
            <th className="table-header-cell">Criticidad</th>
          </tr>
        </thead>
        <tbody className="table-body">
          {data.map((activo) => (
            <tr key={activo.id} className="table-row">
              <td className="table-cell">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {activo.codigo}
                  </div>
                  <div className="text-sm text-gray-500">
                    {activo.nombre}
                  </div>
                  {activo.ubicacion && (
                    <div className="text-xs text-gray-400">
                      {activo.ubicacion}
                    </div>
                  )}
                </div>
              </td>
              <td className="table-cell">
                <div className="text-sm text-gray-900">
                  {activo.cliente.nombre}
                </div>
              </td>
              <td className="table-cell">
                <div className="text-sm text-gray-900">
                  {formatRelativeTime(activo.fechaDetencion)}
                </div>
                {activo.motivoDetencion && (
                  <div className="text-xs text-gray-500">
                    {activo.motivoDetencion}
                  </div>
                )}
              </td>
              <td className="table-cell">
                <span className={`badge ${getStatusColor(activo.criticidad)}`}>
                  {activo.criticidad}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
