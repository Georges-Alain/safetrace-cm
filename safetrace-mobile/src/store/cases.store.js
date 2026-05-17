import { create } from 'zustand';
import { casesAPI } from '../api/cases.api';

export const useCasesStore = create((set) => ({
  cases: [],
  nearbyCases: [],
  loading: false,
  error: null,

  fetchNearbyCases: async (lat, lng) => {
    set({ loading: true, error: null });
    try {
      const result = await casesAPI.list({ lat, lng, radiusKm: 50, status: 'ACTIVE', limit: 10 });
      set({ nearbyCases: result.data, loading: false });
    } catch (e) {
      set({ error: e.error || 'Erreur réseau', loading: false });
    }
  },

  fetchMyCases: async () => {
    set({ loading: true });
    try {
      const result = await casesAPI.list({ limit: 50 });
      set({ cases: result.data, loading: false });
    } catch (e) {
      set({ error: e.error || 'Erreur réseau', loading: false });
    }
  },
}));
