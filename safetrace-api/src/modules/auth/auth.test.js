const request = require('supertest');
const app = require('../../app');
const db = require('../../config/db');

beforeAll(() => db.migrate.latest());
afterAll(() => db.destroy());
afterEach(() => db('users').del());

test('POST /api/auth/register — crée un user et retourne un message OTP', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ phone: '+237612345678', name: 'Test User' });
  expect(res.status).toBe(200);
  expect(res.body.message).toMatch(/OTP/i);
});

test('POST /api/auth/register — rejette un numéro invalide', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ phone: '123', name: 'X' });
  expect(res.status).toBe(400);
});

test('POST /api/auth/verify-otp — retourne tokens avec OTP valide', async () => {
  const otp = '123456';
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await db('users').insert({
    phone: '+237612345678',
    name: 'Test',
    otp_code: otp,
    otp_expires_at: otpExpiry,
    role: 'CITIZEN'
  });
  const res = await request(app)
    .post('/api/auth/verify-otp')
    .send({ phone: '+237612345678', otp });
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('accessToken');
  expect(res.body).toHaveProperty('refreshToken');
});
