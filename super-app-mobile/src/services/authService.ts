import apiClient from './apiClient';

export const authService = {
  async register(phone: string, password: string, fullName: string): Promise<void> {
    await apiClient.post('/auth/register', {
      phone,
      password,
      fullName,
    });
  },

  async login(phone: string, password: string): Promise<{ user: any; accessToken: string; refreshToken: string; expiresIn: number }> {
    const response = await apiClient.post('/auth/login', {
      phone,
      password,
    });
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const response = await apiClient.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
