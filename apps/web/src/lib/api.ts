import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getSession } from 'next-auth/react';

// Configuración base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Crear instancia de axios
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Tipos base
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Funciones de API genéricas
export const api = {
  // GET request
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },

  // POST request
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },

  // PUT request
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },

  // PATCH request
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },

  // Upload file
  upload: async <T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  // Download file
  download: async (url: string, filename?: string): Promise<void> => {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

// APIs específicas por módulo
export const authAPI = {
  login: (credentials: { empresaCodigo: string; username: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  logout: () =>
    api.post('/auth/logout'),
};

export const cotizacionesAPI = {
  getAll: () =>
    api.get('/cotizaciones'),
  
  getById: (id: string) =>
    api.get(`/cotizaciones/${id}`),
  
  create: (data: any) =>
    api.post('/cotizaciones', data),
  
  update: (id: string, data: any) =>
    api.patch(`/cotizaciones/${id}`, data),
  
  addItem: (cotizacionId: string, item: any) =>
    api.post(`/cotizaciones/${cotizacionId}/items`, item),
  
  updateItem: (itemId: string, data: any) =>
    api.patch(`/cotizaciones/items/${itemId}`, data),
  
  asignarPrecios: (cotizacionId: string, data: any) =>
    api.post(`/cotizaciones/${cotizacionId}/asignar-precios`, data),
  
  cambiarEstado: (id: string, estado: string) =>
    api.patch(`/cotizaciones/${id}/estado`, { estado }),
  
  delete: (id: string) =>
    api.delete(`/cotizaciones/${id}`),
  
  generatePDF: (id: string) =>
    api.download(`/cotizaciones/${id}/pdf`, `cotizacion-${id}.pdf`),
};

export const activosAPI = {
  getAll: (params?: { clienteId?: string; estado?: string }) =>
    api.get('/activos', { params }),
  
  getById: (id: string) =>
    api.get(`/activos/${id}`),
  
  create: (data: any) =>
    api.post('/activos', data),
  
  update: (id: string, data: any) =>
    api.patch(`/activos/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/activos/${id}`),
  
  getBitacora: (id: string) =>
    api.get(`/activos/${id}/bitacora`),
  
  importCSV: (file: File, onProgress?: (progress: number) => void) =>
    api.upload('/activos/import', file, onProgress),
};

export const clientesAPI = {
  getAll: () =>
    api.get('/clientes'),
  
  getById: (id: string) =>
    api.get(`/clientes/${id}`),
  
  create: (data: any) =>
    api.post('/clientes', data),
  
  update: (id: string, data: any) =>
    api.patch(`/clientes/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/clientes/${id}`),
};

export const ordenesTrabajoAPI = {
  getAll: (params?: { estado?: string; asignadoA?: string; tipo?: string }) =>
    api.get('/ordenes-trabajo', { params }),
  
  getById: (id: string) =>
    api.get(`/ordenes-trabajo/${id}`),
  
  create: (data: any) =>
    api.post('/ordenes-trabajo', data),
  
  update: (id: string, data: any) =>
    api.patch(`/ordenes-trabajo/${id}`, data),
  
  cambiarEstado: (id: string, estado: string, motivo?: string) =>
    api.patch(`/ordenes-trabajo/${id}/estado`, { estado, motivo }),
  
  asignar: (id: string, usuarioId: string) =>
    api.patch(`/ordenes-trabajo/${id}/asignar`, { usuarioId }),
  
  completar: (id: string, data: any) =>
    api.post(`/ordenes-trabajo/${id}/completar`, data),
};

export const emergenciasAPI = {
  getAll: (params?: { estado?: string; asignadoA?: string }) =>
    api.get('/emergencias', { params }),
  
  getById: (id: string) =>
    api.get(`/emergencias/${id}`),
  
  create: (data: any) =>
    api.post('/emergencias', data),
  
  update: (id: string, data: any) =>
    api.patch(`/emergencias/${id}`, data),
  
  asignar: (id: string, usuarioId: string) =>
    api.patch(`/emergencias/${id}/asignar`, { usuarioId }),
  
  marcarLlegada: (id: string) =>
    api.post(`/emergencias/${id}/llegada`),
  
  resolver: (id: string, data: any) =>
    api.post(`/emergencias/${id}/resolver`, data),
};

export const dashboardAPI = {
  getKPIs: (params?: { mes?: string; clienteId?: string }) =>
    api.get('/dashboard/kpis', { params }),
  
  getActivosDetenidos: () =>
    api.get('/dashboard/activos-detenidos'),
  
  getProximasMantenimientos: () =>
    api.get('/dashboard/proximas-mantenimientos'),
  
  getCotizacionesAbiertas: () =>
    api.get('/dashboard/cotizaciones-abiertas'),
  
  getMetricasDiarias: (params?: { desde?: string; hasta?: string }) =>
    api.get('/dashboard/metricas-diarias', { params }),
};

export default api;
