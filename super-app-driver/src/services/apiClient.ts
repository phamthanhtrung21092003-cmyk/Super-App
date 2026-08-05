import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const devApiUrl = process.env.EXPO_PUBLIC_DEV_API || 'http://192.168.12.109:5000/api/v1';

const apiClient = axios.create({
  baseURL: devApiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config: any) => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

export default apiClient;
