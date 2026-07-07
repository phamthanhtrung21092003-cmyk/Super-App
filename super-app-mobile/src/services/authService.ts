import apiClient from './apiClient';

export const authService = {
  async register(phone: string, password: string, fullName: string): Promise<void> {
    await apiClient.post('/auth/register', {
      phone,
      password,
      fullName,
    });
  },

  async login(phone: string, password: string): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    const response = await apiClient.post('/auth/login', {
      phone,
      password,
    });
    return response.data;
  },
};
