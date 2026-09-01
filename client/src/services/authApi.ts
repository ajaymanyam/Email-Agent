import { api } from './api';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types/auth';

export const authApi = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const res = await api.post<{ success: boolean; data: AuthResponse }>('/auth/register', credentials);
    return res.data.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', credentials);
    return res.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const res = await api.get<{ success: boolean; data: { user: User } }>('/auth/me');
    return res.data.data.user;
  },

  async updateProfile(data: Partial<Pick<User, 'name' | 'preferences'>>): Promise<User> {
    const res = await api.put<{ success: boolean; data: { user: User } }>('/auth/profile', data);
    return res.data.data.user;
  },

  async deleteAccount(): Promise<void> {
    await api.delete('/auth/account');
  },
};
