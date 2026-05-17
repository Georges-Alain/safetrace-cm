const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const db = require('../../config/db');

process.env.JWT_SECRET = 'test_secret';
const token = () => `Bearer ${jwt.sign({ id: 'uid', role: 'CITIZEN' }, 'test_secret')}`;

let caseId;
beforeAll(async () => {
  await db.migrate.latest();
  [caseId] = await db('cases').insert({ person_name: 'Test', status: 'ACTIVE' }).returning('id');
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
