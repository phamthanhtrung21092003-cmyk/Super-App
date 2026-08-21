import { Platform } from 'react-native';
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

    if (Platform.OS === 'web' || file.uri.startsWith('blob:') || file.uri.startsWith('data:')) {
      const res = await fetch(file.uri);
      const blob = await res.blob();
      formData.append('avatar', blob, file.name || 'avatar.jpg');
    } else {
      formData.append('avatar', {
        uri: file.uri,
        name: file.name || 'avatar.jpg',
        type: file.type || 'image/jpeg',
      } as any);
    }

    const headers: Record<string, any> = {};
    if (Platform.OS === 'web') {
      headers['Content-Type'] = undefined;
    } else {
      headers['Content-Type'] = 'multipart/form-data';
    }

    const response = await apiClient.patch('/users/me/avatar', formData, {
      headers,
      transformRequest: (data) => data,
    });
    return response.data;
  },
};

