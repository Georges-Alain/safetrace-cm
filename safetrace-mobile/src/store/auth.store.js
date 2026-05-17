import { create } from 'zustand';
export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  login: async () => {},
  logout: async () => { set({ accessToken: null, user: null }); },
  restoreSession: async () => {},
}));
