import client from './client';

export const casesAPI = {
  list: (params) =>
    client.get('/api/cases', { params }).then((r) => r.data),

  getById: (id) =>
    client.get(`/api/cases/${id}`).then((r) => r.data),

  updateStatus: (id, status) =>
    client.patch(`/api/cases/${id}/status`, { status }).then((r) => r.data),

  resolve: (id) =>
    client.post(`/api/cases/${id}/resolve`).then((r) => r.data),

  getTestimonies: (id) =>
    client.get(`/api/cases/${id}/testimonies`).then((r) => r.data),
};
