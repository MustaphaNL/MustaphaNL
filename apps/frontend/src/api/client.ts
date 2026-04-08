import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
});

// Attach access token to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token on 401
let refreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      if (refreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          });
        });
      }

      refreshing = true;
      try {
        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
        useAuthStore.getState().setAccessToken(data.accessToken);
        refreshQueue.forEach((cb) => cb(data.accessToken));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(original);
      } catch {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
