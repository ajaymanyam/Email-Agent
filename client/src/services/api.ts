import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '@/store/authStore';

export const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  return 'http://localhost:5000/api';
};

export const api: AxiosInstance = axios.create({
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Explicitly format absolute URL and attach JWT token to every request
api.interceptors.request.use((config) => {
  const base = getBaseUrl();
  if (config.url && !config.url.startsWith('http')) {
    const cleanPath = config.url.startsWith('/') ? config.url : `/${config.url}`;
    config.url = `${base}${cleanPath}`;
    config.baseURL = '';
  }
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — log user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.'
    );
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}
