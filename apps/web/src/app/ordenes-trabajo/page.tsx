'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function OrdenesTrabajoPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de Trabajo</h1>
          <p className="mt-1 text-sm text-gray-600">
            Supervisa el ciclo de vida de las órdenes de trabajo desde su creación hasta el cierre.
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">
            Aquí podrás asignar técnicos, adjuntar evidencias y monitorear el avance de cada orden.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
