import { apiClient } from './client';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  postcode: string;
  neighbourhood: string;
  phone?: string;
  profilePhoto?: string;
  bio?: string;
  roles: string[];
  isAdmin: boolean;
  availability: string[];
  interests: string[];
  isVerified: boolean;
  createdAt: string;
}

export const authApi = {
  register: (data: Record<string, unknown>) =>
    apiClient.post('/auth/register', data).then((r) => r.data),

  login: (email: string, password: string) =>
    apiClient.post<{ accessToken: string; refreshToken: string; user: UserProfile }>(
      '/auth/login', { email, password }
    ).then((r) => r.data),

  verifyEmail: (token: string) =>
    apiClient.get('/auth/verify-email', { params: { token } }).then((r) => r.data),

  me: () =>
    apiClient.get<UserProfile>('/auth/me').then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient.post<{ accessToken: string }>('/auth/refresh', { refreshToken }).then((r) => r.data),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }).then((r) => r.data),
};
