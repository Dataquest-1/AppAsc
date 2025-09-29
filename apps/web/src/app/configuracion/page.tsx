'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ConfiguracionPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="mt-1 text-sm text-gray-600">
            Ajusta la información corporativa, integraciones y preferencias del sistema.
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">
            Próximamente podrás personalizar la experiencia de tu empresa desde esta configuración avanzada.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
