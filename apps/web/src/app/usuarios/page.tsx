'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function UsuariosPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="mt-1 text-sm text-gray-600">
            Administra los miembros del equipo, sus roles y niveles de acceso dentro de la plataforma.
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">
            En breve podrás invitar usuarios, asignar roles y gestionar permisos desde esta sección.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
