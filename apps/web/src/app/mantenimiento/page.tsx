'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function MantenimientoPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mantenimiento</h1>
          <p className="mt-1 text-sm text-gray-600">
            Planifica y controla los planes de mantenimiento preventivo y correctivo.
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">
            Próximamente podrás crear planes, definir periodicidades y seguir su cumplimiento en esta sección.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
