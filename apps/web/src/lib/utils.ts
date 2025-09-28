import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'CLP'): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'datetime' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('es-CL');
    case 'long':
      return dateObj.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'datetime':
      return dateObj.toLocaleString('es-CL');
    default:
      return dateObj.toLocaleDateString('es-CL');
  }
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'hace unos segundos';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  }

  return formatDate(dateObj);
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Estados de activos
    operativo: 'bg-success-100 text-success-800',
    detenido: 'bg-danger-100 text-danger-800',
    mantenimiento: 'bg-warning-100 text-warning-800',
    fuera_servicio: 'bg-gray-100 text-gray-800',
    
    // Estados de cotizaciones
    borrador: 'bg-gray-100 text-gray-800',
    en_revision: 'bg-blue-100 text-blue-800',
    lista_envio: 'bg-purple-100 text-purple-800',
    enviada: 'bg-indigo-100 text-indigo-800',
    aprobada: 'bg-success-100 text-success-800',
    rechazada: 'bg-danger-100 text-danger-800',
    cerrada: 'bg-gray-100 text-gray-800',
    
    // Estados de órdenes de trabajo
    nueva: 'bg-blue-100 text-blue-800',
    asignada: 'bg-yellow-100 text-yellow-800',
    en_curso: 'bg-orange-100 text-orange-800',
    en_espera: 'bg-purple-100 text-purple-800',
    cerrada: 'bg-success-100 text-success-800',
    cancelada: 'bg-danger-100 text-danger-800',
    
    // Prioridades
    baja: 'bg-blue-100 text-blue-800',
    media: 'bg-yellow-100 text-yellow-800',
    alta: 'bg-orange-100 text-orange-800',
    critica: 'bg-danger-100 text-danger-800',
    
    // Urgencias
    // baja, media, alta ya están definidas arriba
  };

  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

export function getPriorityIcon(priority: string): string {
  const icons: Record<string, string> = {
    baja: '🔵',
    media: '🟡',
    alta: '🟠',
    critica: '🔴',
  };

  return icons[priority] || '⚪';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function generateQRCodeUrl(data: string): string {
  // En producción, usar una librería de QR codes
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+?56)?[2-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('56')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  return `${cleaned.slice(0, 1)} ${cleaned.slice(1, 5)} ${cleaned.slice(5)}`;
}

export function calculateSLA(startTime: Date, endTime: Date, slaMinutes: number): {
  elapsed: number;
  remaining: number;
  percentage: number;
  isOverdue: boolean;
} {
  const elapsedMs = endTime.getTime() - startTime.getTime();
  const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
  const remaining = Math.max(0, slaMinutes - elapsedMinutes);
  const percentage = Math.min(100, (elapsedMinutes / slaMinutes) * 100);
  const isOverdue = elapsedMinutes > slaMinutes;

  return {
    elapsed: elapsedMinutes,
    remaining,
    percentage,
    isOverdue,
  };
}
