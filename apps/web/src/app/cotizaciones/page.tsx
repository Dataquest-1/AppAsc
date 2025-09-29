'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CotizacionesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
          <p className="mt-1 text-sm text-gray-600">
            Crea, revisa y da seguimiento a las cotizaciones colaborativas de mantenimiento.
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">
            Estamos preparando el flujo colaborativo de cotizaciones. Muy pronto podrás gestionarlas desde aquí.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
