import axios from 'axios';
import { tokens } from '../utils/tokens';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const client = axios.create({ baseURL: `${API_URL}/api`, timeout: 10000 });

let refreshPromise = null;

client.interceptors.request.use(async (config) => {
  const token = await tokens.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = await tokens.getRefresh();
      if (refresh) {
        try {
          if (!refreshPromise) {
            refreshPromise = axios
              .post(`${API_URL}/api/auth/refresh`, { refreshToken: refresh }, { timeout: 10000 })
              .finally(() => { refreshPromise = null; });
          }
          const { data } = await refreshPromise;
          const newRefresh = data.refreshToken ?? refresh;
          await tokens.save(data.accessToken, newRefresh);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return client(error.config);
        } catch {
          await tokens.clear();
          const { useAuthStore } = require('../store/auth.store');
          useAuthStore.getState().logout();
        }
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default client;
