const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const db = require('../../config/db');

process.env.JWT_SECRET = 'test_secret';
const officerToken = () => `Bearer ${jwt.sign({ id: 'officer-id', role: 'OFFICER' }, 'test_secret')}`;
const citizenToken = () => `Bearer ${jwt.sign({ id: 'cit-id', role: 'CITIZEN' }, 'test_secret')}`;

beforeAll(() => db.migrate.latest());
afterAll(() => db.destroy());

test('GET /api/admin/stats — OFFICER peut accéder aux stats', async () => {
  const res = await request(app)
    .get('/api/admin/stats')
    .set('Authorization', officerToken());
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('active');
  expect(res.body).toHaveProperty('resolved');
  expect(res.body).toHaveProperty('pending');
});

test('GET /api/admin/stats — CITIZEN reçoit 403', async () => {
  const res = await request(app)
    .get('/api/admin/stats')
    .set('Authorization', citizenToken());
  expect(res.status).toBe(403);
});
