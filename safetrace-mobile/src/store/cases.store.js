import { create } from 'zustand';
import { casesAPI } from '../api/cases.api';

export const useCasesStore = create((set, get) => ({
  cases: [],
  feedCases: [],
  nearbyCases: [],
  loading: false,
  error: null,

  fetchFeed: async () => {
    set({ loading: true, error: null });
    try {
      const result = await casesAPI.list({ status: 'ACTIVE,INQUIRY', limit: 30 });
      set({ feedCases: result.data ?? [], loading: false });
    } catch (e) {
      set({ error: e.error || 'Erreur réseau', loading: false });
    }
  },

  refreshFeed: async () => {
    await get().fetchFeed();
  },

  fetchNearbyCases: async (lat, lng) => {
    set({ loading: true, error: null });
    try {
      const result = await casesAPI.list({ lat, lng, radiusKm: 50, status: 'ACTIVE', limit: 10 });
      set({ nearbyCases: result.data ?? [], loading: false });
    } catch (e) {
      set({ error: e.error || 'Erreur réseau', loading: false });
    }
  },

  fetchMyCases: async () => {
    set({ loading: true });
    try {
      const result = await casesAPI.list({ limit: 50 });
      set({ cases: result.data ?? [], loading: false });
    } catch (e) {
      set({ error: e.error || 'Erreur réseau', loading: false });
    }
  },
}));
