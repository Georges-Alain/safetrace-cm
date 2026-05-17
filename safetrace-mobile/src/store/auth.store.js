import { create } from 'zustand';
import { tokens } from '../utils/tokens';
import { authAPI } from '../api/auth.api';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,

  login: async (phone, otp) => {
    const data = await authAPI.verifyOTP(phone, otp);
    await tokens.save(data.accessToken, data.refreshToken);
    set({ accessToken: data.accessToken, user: data.user });
  },

  logout: async () => {
    await tokens.clear();
    set({ accessToken: null, user: null });
  },

  restoreSession: async () => {
    const token = await tokens.getAccess();
    if (token) set({ accessToken: token });
  },
}));
