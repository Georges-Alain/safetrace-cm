const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const db = require('../../config/db');

process.env.JWT_SECRET = 'test_secret';

let userId, caseId;
const token = () => `Bearer ${jwt.sign({ id: userId, role: 'CITIZEN' }, 'test_secret')}`;

beforeAll(async () => {
  await db.migrate.latest();
  await db('cases').del();
  await db('users').del();
  const [userRow] = await db('users').insert({ phone: '+237600000002', role: 'CITIZEN' }).returning('id');
  userId = userRow?.id ?? userRow;
  const [caseRow] = await db('cases').insert({ person_name: 'Test', status: 'ACTIVE' }).returning('id');
  caseId = caseRow?.id ?? caseRow;
});
afterAll(() => db.destroy());

test('POST /api/testimonies — soumet un témoignage', async () => {
  const res = await request(app)
    .post('/api/testimonies')
    .set('Authorization', token())
    .send({ case_id: caseId, content: 'Je l\'ai vu hier matin près du marché.', latitude: 3.85, longitude: 11.51 });
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('id');
});

test('GET /api/cases/:id/testimonies — liste les témoignages d\'un dossier', async () => {
  const res = await request(app)
    .get(`/api/cases/${caseId}/testimonies`)
    .set('Authorization', token());
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

afterEach(() => db('testimonies').del());

test('POST /api/testimonies — 403 si le dossier est RESOLVED', async () => {
  const [resolvedRow] = await db('cases').insert({ person_name: 'Résolu', status: 'RESOLVED' }).returning('id');
  const resolvedId = resolvedRow?.id ?? resolvedRow;
  const res = await request(app)
    .post('/api/testimonies')
    .set('Authorization', token())
    .send({ case_id: resolvedId, content: 'Je voulais témoigner mais trop tard.' });
  expect(res.status).toBe(403);
});

test('POST /api/testimonies — 403 si le dossier est PENDING', async () => {
  const [pendingRow] = await db('cases').insert({ person_name: 'En attente', status: 'PENDING' }).returning('id');
  const pendingId = pendingRow?.id ?? pendingRow;
  const res = await request(app)
    .post('/api/testimonies')
    .set('Authorization', token())
    .send({ case_id: pendingId, content: 'Je voulais témoigner.' });
  expect(res.status).toBe(403);
});
