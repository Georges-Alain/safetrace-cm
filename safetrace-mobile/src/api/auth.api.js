import axios from 'axios';

const BASE = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000') + '/api';

export const authAPI = {
  register: (phone, name) =>
    axios.post(`${BASE}/auth/register`, { phone, name }).then((r) => r.data),
  verifyOTP: (phone, otp) =>
    axios.post(`${BASE}/auth/verify-otp`, { phone, otp }).then((r) => r.data),
};
