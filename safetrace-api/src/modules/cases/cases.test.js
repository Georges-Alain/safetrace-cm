const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const db = require('../../config/db');

process.env.JWT_SECRET = 'test_secret';

let userId;
function makeToken(role = 'FAMILY') {
  return jwt.sign({ id: userId, role }, 'test_secret');
}

beforeAll(async () => {
  await db.migrate.latest();
  await db('cases').del();
  await db('users').del();
  const [row] = await db('users').insert({ phone: '+237600000001', role: 'FAMILY' }).returning('id');
  userId = row?.id ?? row;
});
afterAll(() => db.destroy());
afterEach(() => db('cases').del());

test('POST /api/cases — crée un signalement (FAMILY)', async () => {
  const res = await request(app)
    .post('/api/cases')
    .set('Authorization', `Bearer ${makeToken('FAMILY')}`)
    .send({
      person_name: 'Kofi Mballa',
      person_age: 14,
      person_gender: 'M',
      last_seen_location: 'Yaoundé Centre',
      last_seen_at: new Date().toISOString(),
      latitude: 3.848,
      longitude: 11.502
    });
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('id');
  expect(res.body.status).toBe('ACTIVE');
});

test('POST /api/cases — 401 sans token', async () => {
  const res = await request(app).post('/api/cases').send({ person_name: 'X' });
  expect(res.status).toBe(401);
});

test('GET /api/cases — retourne la liste paginée', async () => {
  const res = await request(app)
    .get('/api/cases')
    .set('Authorization', `Bearer ${makeToken()}`);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.data)).toBe(true);
  expect(res.body).toHaveProperty('total');
});

test('PATCH /api/cases/:id/status — OFFICER peut changer le statut', async () => {
  const [row] = await db('cases').insert({
    person_name: 'Test',
    status: 'PENDING',
    reporter_id: null
  }).returning('id');
  const caseId = row?.id ?? row;
  const res = await request(app)
    .patch(`/api/cases/${caseId}/status`)
    .set('Authorization', `Bearer ${makeToken('OFFICER')}`)
    .send({ status: 'ACTIVE' });
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ACTIVE');
});
