import client from './client';

export const authAPI = {
  register: (phone, name) =>
    client.post('/api/auth/register', { phone, name }).then((r) => r.data),

  verifyOtp: (phone, code) =>
    client.post('/api/auth/verify-otp', { phone, code }).then((r) => r.data),

  refresh: (refreshToken) =>
    client.post('/api/auth/refresh', { refreshToken }).then((r) => r.data),
};
