const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const { requireAuth, requireRole } = require('./auth');

process.env.JWT_SECRET = 'test_secret';

const app = express();
app.use(express.json());
app.get('/protected', requireAuth, (req, res) => res.json({ user: req.user }));
app.get('/officer-only', requireAuth, requireRole('OFFICER'), (req, res) => res.json({ ok: true }));

test('requireAuth — 401 sans token', async () => {
  const res = await request(app).get('/protected');
  expect(res.status).toBe(401);
});

test('requireAuth — 200 avec token valide', async () => {
  const token = jwt.sign({ id: '1', role: 'CITIZEN' }, 'test_secret');
  const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`);
  expect(res.status).toBe(200);
  expect(res.body.user.role).toBe('CITIZEN');
});

test('requireRole — 403 pour mauvais rôle', async () => {
  const token = jwt.sign({ id: '1', role: 'CITIZEN' }, 'test_secret');
  const res = await request(app).get('/officer-only').set('Authorization', `Bearer ${token}`);
  expect(res.status).toBe(403);
});

test('requireRole — 200 pour bon rôle', async () => {
  const token = jwt.sign({ id: '1', role: 'OFFICER' }, 'test_secret');
  const res = await request(app).get('/officer-only').set('Authorization', `Bearer ${token}`);
  expect(res.status).toBe(200);
});
