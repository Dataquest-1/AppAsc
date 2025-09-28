'use client';

import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'gray';
  loading?: boolean;
  trend?: 'up' | 'down';
  trendValue?: string;
}

const colorClasses = {
  blue: 'text-blue-600 bg-blue-100',
  green: 'text-green-600 bg-green-100',
  red: 'text-red-600 bg-red-100',
  purple: 'text-purple-600 bg-purple-100',
  orange: 'text-orange-600 bg-orange-100',
  gray: 'text-gray-600 bg-gray-100',
};

const trendClasses = {
  up: 'text-green-600',
  down: 'text-red-600',
};

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  loading = false,
  trend,
  trendValue,
}: KPICardProps) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={cn('p-3 rounded-lg', colorClasses[color])}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <div className="text-2xl font-semibold text-gray-900">
                      {value}
                    </div>
                    {trend && (
                      <div className={cn('ml-2 flex items-baseline text-sm font-semibold', trendClasses[trend])}>
                        {trend === 'up' ? (
                          <ArrowUpIcon className="h-3 w-3 flex-shrink-0 self-center" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3 flex-shrink-0 self-center" />
                        )}
                        {trendValue && <span className="ml-1">{trendValue}</span>}
                      </div>
                    )}
                  </>
                )}
              </dd>
              {subtitle && (
                <dd className="text-sm text-gray-500 mt-1">
                  {subtitle}
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
