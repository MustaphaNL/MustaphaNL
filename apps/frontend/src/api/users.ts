import { apiClient } from './client';
import type { UserProfile } from './auth';

export const usersApi = {
  getProfile: (id: string) =>
    apiClient.get(`/users/${id}`).then((r) => r.data),

  updateMe: (data: Partial<UserProfile> & Record<string, unknown>) =>
    apiClient.patch<UserProfile>('/users/me', data).then((r) => r.data),

  uploadPhoto: (file: File) => {
    const fd = new FormData();
    fd.append('photo', file);
    return apiClient.post<{ profilePhoto: string }>('/users/me/photo', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post('/users/me/change-password', { currentPassword, newPassword }).then((r) => r.data),

  deleteAccount: () =>
    apiClient.delete('/users/me').then((r) => r.data),
};
