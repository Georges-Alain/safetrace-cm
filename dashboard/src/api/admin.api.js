import client from './client';

export const adminAPI = {
  getStats: () =>
    client.get('/api/admin/stats').then((r) => r.data),

  getPendingCases: () =>
    client.get('/api/admin/pending').then((r) => r.data),
};
