import { apiClient } from './client';

export const adminApi = {
  getStats: () =>
    apiClient.get('/admin/stats').then((r) => r.data),

  getPageViews: (days = 30) =>
    apiClient.get<{ date: string; count: number }[]>('/admin/page-views', { params: { days } }).then((r) => r.data),

  getUsers: (params?: { page?: number; pageSize?: number; search?: string }) =>
    apiClient.get('/admin/users', { params }).then((r) => r.data),

  updateUser: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/admin/users/${id}`, data).then((r) => r.data),

  deleteUser: (id: string) =>
    apiClient.delete(`/admin/users/${id}`).then((r) => r.data),

  getListings: (params?: { page?: number; pageSize?: number; search?: string; status?: string }) =>
    apiClient.get('/admin/listings', { params }).then((r) => r.data),

  updateListing: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/admin/listings/${id}`, data).then((r) => r.data),

  deleteListing: (id: string) =>
    apiClient.delete(`/admin/listings/${id}`).then((r) => r.data),

  exportUsers: () => {
    const API_URL = import.meta.env.VITE_API_URL || '';
    window.open(`${API_URL}/api/admin/export/users`, '_blank');
  },

  exportListings: () => {
    const API_URL = import.meta.env.VITE_API_URL || '';
    window.open(`${API_URL}/api/admin/export/listings`, '_blank');
  },
};
