'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ClientesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona el listado de clientes, sus ubicaciones y datos de contacto.
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">
            Próximamente podrás crear, importar y administrar clientes desde esta sección.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
