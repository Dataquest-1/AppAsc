'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DocumentosPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Centraliza las evidencias, certificados y archivos relacionados con las operaciones.
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">
            Estamos construyendo el gestor documental para que puedas almacenar y compartir archivos de forma segura.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
