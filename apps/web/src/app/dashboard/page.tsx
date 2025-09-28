'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { dashboardAPI } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { MetricasChart } from '@/components/dashboard/MetricasChart';
import { ActivosDetenidosTable } from '@/components/dashboard/ActivosDetenidosTable';
import { ProximasMantenimientosTable } from '@/components/dashboard/ProximasMantenimientosTable';
import { CotizacionesAbiertasTable } from '@/components/dashboard/CotizacionesAbiertasTable';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { ClienteFilter } from '@/components/dashboard/ClienteFilter';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  ClockIcon, 
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');

  // Consultar KPIs principales
  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['dashboard-kpis', selectedMonth, selectedClienteId],
    queryFn: () => dashboardAPI.getKPIs({ 
      mes: selectedMonth, 
      clienteId: selectedClienteId || undefined 
    }),
    enabled: !!session,
  });

  // Consultar activos detenidos
  const { data: activosDetenidos, isLoading: activosLoading } = useQuery({
    queryKey: ['dashboard-activos-detenidos'],
    queryFn: () => dashboardAPI.getActivosDetenidos(),
    enabled: !!session,
  });

  // Consultar próximas mantenciones
  const { data: proximasMantenimientos, isLoading: mantenimientosLoading } = useQuery({
    queryKey: ['dashboard-proximas-mantenimientos'],
    queryFn: () => dashboardAPI.getProximasMantenimientos(),
    enabled: !!session,
  });

  // Consultar cotizaciones abiertas
  const { data: cotizacionesAbiertas, isLoading: cotizacionesLoading } = useQuery({
    queryKey: ['dashboard-cotizaciones-abiertas'],
    queryFn: () => dashboardAPI.getCotizacionesAbiertas(),
    enabled: !!session,
  });

  // Consultar métricas diarias para el gráfico
  const { data: metricasDiarias, isLoading: metricasLoading } = useQuery({
    queryKey: ['dashboard-metricas-diarias', selectedMonth],
    queryFn: () => {
      const startDate = new Date(selectedMonth + '-01');
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      return dashboardAPI.getMetricasDiarias({
        desde: startDate.toISOString().split('T')[0],
        hasta: endDate.toISOString().split('T')[0],
      });
    },
    enabled: !!session,
  });

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Bienvenido, {session.user?.name} - {session.user?.empresaNombre}
            </p>
          </div>
          
          {/* Filtros */}
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
            <ClienteFilter
              value={selectedClienteId}
              onChange={setSelectedClienteId}
            />
            <DateFilter
              value={selectedMonth}
              onChange={setSelectedMonth}
            />
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="SLA Promedio"
            value={kpis?.slaPromedio ? `${kpis.slaPromedio}%` : '-'}
            subtitle="Cumplimiento de SLA"
            icon={ClockIcon}
            color="blue"
            loading={kpisLoading}
            trend={kpis?.slaPromedio >= 85 ? 'up' : 'down'}
          />
          
          <KPICard
            title="Equipos Detenidos"
            value={kpis?.pctDetenidos ? `${kpis.pctDetenidos}%` : '-'}
            subtitle="% del total de activos"
            icon={ExclamationTriangleIcon}
            color={kpis?.pctDetenidos > 20 ? 'red' : 'green'}
            loading={kpisLoading}
            trend={kpis?.pctDetenidos <= 10 ? 'up' : 'down'}
          />
          
          <KPICard
            title="Cobertura Mantto"
            value={kpis?.coberturaMant ? `${kpis.coberturaMant}%` : '-'}
            subtitle="Realizado vs Planificado"
            icon={WrenchScrewdriverIcon}
            color="purple"
            loading={kpisLoading}
            trend={kpis?.coberturaMant >= 90 ? 'up' : 'down'}
          />
          
          <KPICard
            title="Cotizaciones Abiertas"
            value={kpis?.cotizacionesAbiertas?.toString() || '-'}
            subtitle="Pendientes de cierre"
            icon={DocumentTextIcon}
            color="orange"
            loading={kpisLoading}
          />
        </div>

        {/* Gráfico de métricas diarias */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-gray-400" />
              Actividad Diaria
            </h3>
            <p className="text-sm text-gray-500">
              Mantenimientos, reparaciones y emergencias por día
            </p>
          </div>
          <div className="card-body">
            {metricasLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <MetricasChart data={metricasDiarias || []} />
            )}
          </div>
        </div>

        {/* Tablas de información */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activos Detenidos */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-400" />
                Activos Detenidos
              </h3>
              <p className="text-sm text-gray-500">
                Equipos que requieren atención inmediata
              </p>
            </div>
            <div className="card-body p-0">
              {activosLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : (
                <ActivosDetenidosTable data={activosDetenidos || []} />
              )}
            </div>
          </div>

          {/* Próximas Mantenciones */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-blue-400" />
                Próximas Mantenciones
              </h3>
              <p className="text-sm text-gray-500">
                Mantenimientos programados para el próximo mes
              </p>
            </div>
            <div className="card-body p-0">
              {mantenimientosLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : (
                <ProximasMantenimientosTable data={proximasMantenimientos || []} />
              )}
            </div>
          </div>
        </div>

        {/* Cotizaciones Abiertas */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-orange-400" />
              Cotizaciones Abiertas
            </h3>
            <p className="text-sm text-gray-500">
              Cotizaciones pendientes de aprobación o cierre
            </p>
          </div>
          <div className="card-body p-0">
            {cotizacionesLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <CotizacionesAbiertasTable data={cotizacionesAbiertas || []} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
