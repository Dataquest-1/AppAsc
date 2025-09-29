'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function EmergenciasPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emergencias</h1>
          <p className="mt-1 text-sm text-gray-600">
            Da seguimiento a los incidentes críticos y monitorea el cumplimiento de los SLA.
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">
            Esta vista permitirá coordinar la respuesta y resolver emergencias en el menor tiempo posible.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
