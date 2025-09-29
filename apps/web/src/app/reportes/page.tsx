'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ReportesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="mt-1 text-sm text-gray-600">
            Genera reportes operativos y ejecutivos con los indicadores clave de mantenimiento.
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">
            Pronto podrás descargar reportes personalizados y compartirlos con tus clientes desde aquí.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
