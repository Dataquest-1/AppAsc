'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ActivosPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Consulta y gestiona el inventario de activos críticos de tus clientes.
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">
            El listado de activos y su bitácora estarán disponibles aquí muy pronto.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
