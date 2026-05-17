import client from './client';

export const casesAPI = {
  list: (params) => client.get('/cases', { params }),
  getById: (id) => client.get(`/cases/${id}`),
  create: (data) => client.post('/cases', data),
  resolve: (id) => client.post(`/cases/${id}/resolve`),
};
