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

  async uploadAvatar(file: { uri: string; name: string; type: string }): Promise<any> {
    const formData = new FormData();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    formData.append('avatar', file as any);

    const response = await apiClient.patch('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
