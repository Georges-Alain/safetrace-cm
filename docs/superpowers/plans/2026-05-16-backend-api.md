# SafeTrace — Plan 1 : Backend API

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire l'API REST Node.js/Express avec PostgreSQL qui alimente l'app mobile et le dashboard police.

**Architecture:** API REST avec Express, base de données PostgreSQL + PostGIS pour la géolocalisation, authentification OTP via Africa's Talking, notifications push Firebase FCM. Chaque module est un dossier isolé avec ses routes, son service et ses tests.

**Tech Stack:** Node.js 20, Express 4, PostgreSQL 15 + PostGIS, Knex.js (migrations + queries), Jest + Supertest (tests), Africa's Talking SDK, Firebase Admin SDK, Cloudinary SDK, JWT, bcrypt, dotenv.

---

## Structure des fichiers

```
safetrace-api/
├── src/
│   ├── app.js                  # Express app (sans listen)
│   ├── server.js               # Point d'entrée (listen)
│   ├── config/
│   │   ├── db.js               # Connexion Knex/PostgreSQL
│   │   ├── firebase.js         # Init Firebase Admin
│   │   └── sms.js              # Init Africa's Talking
│   ├── middleware/
│   │   ├── auth.js             # Vérif JWT + rôles
│   │   ├── rateLimit.js        # Rate limiting par IP/user
│   │   └── validate.js         # Validation Joi des body
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.test.js
│   │   ├── cases/
│   │   │   ├── cases.routes.js
│   │   │   ├── cases.service.js
│   │   │   └── cases.test.js
│   │   ├── testimonies/
│   │   │   ├── testimonies.routes.js
│   │   │   ├── testimonies.service.js
│   │   │   └── testimonies.test.js
│   │   ├── alerts/
│   │   │   ├── alerts.service.js
│   │   │   └── alerts.test.js
│   │   ├── media/
│   │   │   ├── media.routes.js
│   │   │   └── media.service.js
│   │   └── admin/
│   │       ├── admin.routes.js
│   │       ├── admin.service.js
│   │       └── admin.test.js
│   └── db/
│       └── migrations/
│           ├── 001_create_users.js
│           ├── 002_create_cases.js
│           ├── 003_create_testimonies.js
│           └── 004_create_alerts.js
├── .env.example
├── jest.config.js
├── knexfile.js
└── package.json
```

---

## Task 1 : Initialisation du projet

**Files:**
- Créer : `safetrace-api/package.json`
- Créer : `safetrace-api/.env.example`
- Créer : `safetrace-api/knexfile.js`
- Créer : `safetrace-api/jest.config.js`

- [ ] **Étape 1 : Créer le dossier et initialiser npm**

```bash
mkdir safetrace-api && cd safetrace-api
npm init -y
```

- [ ] **Étape 2 : Installer les dépendances**

```bash
npm install express knex pg dotenv jsonwebtoken bcryptjs joi africastalking firebase-admin cloudinary multer cors helmet express-rate-limit
npm install --save-dev jest supertest @types/jest nodemon
```

- [ ] **Étape 3 : Créer `.env.example`**

```env
# Serveur
PORT=3000
NODE_ENV=development

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/safetrace_db

# JWT
JWT_SECRET=change_me_to_a_long_random_string
JWT_REFRESH_SECRET=another_long_random_string

# Africa's Talking
AT_API_KEY=your_api_key
AT_USERNAME=sandbox
AT_SENDER_ID=SAFETRACE

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

- [ ] **Étape 4 : Créer `knexfile.js`**

```js
require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: { directory: './src/db/migrations' },
    pool: { min: 2, max: 10 }
  },
  test: {
    client: 'pg',
    connection: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
    migrations: { directory: './src/db/migrations' },
    pool: { min: 1, max: 5 }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: { directory: './src/db/migrations' },
    pool: { min: 2, max: 20 }
  }
};
```

- [ ] **Étape 5 : Créer `jest.config.js`**

```js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  setupFilesAfterFramework: [],
  testTimeout: 10000
};
```

- [ ] **Étape 6 : Ajouter scripts dans `package.json`**

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "test": "jest --forceExit",
  "migrate": "knex migrate:latest",
  "migrate:rollback": "knex migrate:rollback"
}
```

- [ ] **Étape 7 : Commit**

```bash
git add .
git commit -m "feat: initialize safetrace-api project"
```

---

## Task 2 : Base de données — migrations

**Files:**
- Créer : `src/db/migrations/001_create_users.js`
- Créer : `src/db/migrations/002_create_cases.js`
- Créer : `src/db/migrations/003_create_testimonies.js`
- Créer : `src/db/migrations/004_create_alerts.js`
- Créer : `src/config/db.js`

- [ ] **Étape 1 : Créer `src/config/db.js`**

```js
const knex = require('knex');
const config = require('../../knexfile');

const env = process.env.NODE_ENV || 'development';
const db = knex(config[env]);

module.exports = db;
```

- [ ] **Étape 2 : Migration users**

```js
// src/db/migrations/001_create_users.js
exports.up = (knex) =>
  knex.schema.raw('CREATE EXTENSION IF NOT EXISTS postgis').then(() =>
    knex.schema.createTable('users', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.string('phone', 20).notNullable().unique();
      t.string('name', 100);
      t.enu('role', ['CITIZEN', 'FAMILY', 'OFFICER', 'ADMIN']).defaultTo('CITIZEN');
      t.string('region', 100);
      t.string('push_token');
      t.boolean('is_verified').defaultTo(false);
      t.timestamp('verified_at');
      t.timestamps(true, true);
    })
  );

exports.down = (knex) => knex.schema.dropTable('users');
```

- [ ] **Étape 3 : Migration cases**

```js
// src/db/migrations/002_create_cases.js
exports.up = (knex) =>
  knex.schema.createTable('cases', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('reporter_id').references('id').inTable('users').onDelete('SET NULL');
    t.string('person_name', 150).notNullable();
    t.integer('person_age');
    t.enu('person_gender', ['M', 'F', 'OTHER']);
    t.text('description');
    t.string('photo_url');
    t.string('last_seen_location', 255);
    t.timestamp('last_seen_at');
    t.specificType('location', 'GEOGRAPHY(POINT, 4326)');
    t.enu('status', ['PENDING', 'ACTIVE', 'INQUIRY', 'RESOLVED']).defaultTo('PENDING');
    t.uuid('validated_by').references('id').inTable('users').onDelete('SET NULL');
    t.timestamp('resolved_at');
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTable('cases');
```

- [ ] **Étape 4 : Migration testimonies**

```js
// src/db/migrations/003_create_testimonies.js
exports.up = (knex) =>
  knex.schema.createTable('testimonies', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('case_id').notNullable().references('id').inTable('cases').onDelete('CASCADE');
    t.uuid('author_id').references('id').inTable('users').onDelete('SET NULL');
    t.text('content').notNullable();
    t.string('photo_url');
    t.specificType('location', 'GEOGRAPHY(POINT, 4326)');
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTable('testimonies');
```

- [ ] **Étape 5 : Migration alerts**

```js
// src/db/migrations/004_create_alerts.js
exports.up = (knex) =>
  knex.schema.createTable('alerts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('case_id').notNullable().references('id').inTable('cases').onDelete('CASCADE');
    t.enu('channel', ['PUSH', 'SMS']).notNullable();
    t.integer('recipients_count').defaultTo(0);
    t.timestamp('sent_at').defaultTo(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable('alerts');
```

- [ ] **Étape 6 : Lancer les migrations**

```bash
cp .env.example .env
# Remplir DATABASE_URL avec votre PostgreSQL local
npm run migrate
```
Résultat attendu : `Batch 1 run: 4 migrations`

- [ ] **Étape 7 : Commit**

```bash
git add src/db src/config/db.js
git commit -m "feat: add database migrations with PostGIS support"
```

---

## Task 3 : App Express de base

**Files:**
- Créer : `src/app.js`
- Créer : `src/server.js`
- Créer : `src/middleware/auth.js`
- Créer : `src/middleware/validate.js`

- [ ] **Étape 1 : Créer `src/app.js`**

```js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

module.exports = app;
```

- [ ] **Étape 2 : Créer `src/server.js`**

```js
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SafeTrace API running on port ${PORT}`));
```

- [ ] **Étape 3 : Écrire le test de santé**

```js
// src/app.test.js
const request = require('supertest');
const app = require('./app');

test('GET /health returns ok', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ok');
});
```

- [ ] **Étape 4 : Lancer le test**

```bash
npm test -- --testPathPattern=app.test.js
```
Résultat attendu : `PASS src/app.test.js`

- [ ] **Étape 5 : Créer `src/middleware/auth.js`**

```js
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
```

- [ ] **Étape 6 : Créer `src/middleware/validate.js`**

```js
const Joi = require('joi');

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Données invalides',
        details: error.details.map((d) => d.message)
      });
    }
    next();
  };
}

module.exports = { validate };
```

- [ ] **Étape 7 : Commit**

```bash
git add src/app.js src/server.js src/middleware/
git commit -m "feat: bootstrap Express app with auth middleware"
```

---

## Task 4 : Module Auth (OTP + JWT)

**Files:**
- Créer : `src/modules/auth/auth.routes.js`
- Créer : `src/modules/auth/auth.service.js`
- Créer : `src/modules/auth/auth.test.js`

- [ ] **Étape 1 : Créer `src/config/sms.js`**

```js
const AfricasTalking = require('africastalking');

const at = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
});

module.exports = at.SMS;
```

- [ ] **Étape 2 : Écrire les tests auth**

```js
// src/modules/auth/auth.test.js
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
  // Seed user avec otp connu
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
```

- [ ] **Étape 3 : Lancer les tests — vérifier qu'ils échouent**

```bash
npm test -- --testPathPattern=auth.test.js
```
Résultat attendu : `FAIL` (routes non définies)

- [ ] **Étape 4 : Ajouter colonnes OTP à la migration users**

Créer `src/db/migrations/005_add_otp_to_users.js` :

```js
exports.up = (knex) =>
  knex.schema.table('users', (t) => {
    t.string('otp_code', 6);
    t.timestamp('otp_expires_at');
    t.string('refresh_token');
  });

exports.down = (knex) =>
  knex.schema.table('users', (t) => {
    t.dropColumns('otp_code', 'otp_expires_at', 'refresh_token');
  });
```

```bash
npm run migrate
```

- [ ] **Étape 5 : Créer `src/modules/auth/auth.service.js`**

```js
const db = require('../../config/db');
const jwt = require('jsonwebtoken');
const sms = require('../../config/sms');

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function register({ phone, name }) {
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  const existing = await db('users').where({ phone }).first();
  if (existing) {
    await db('users').where({ phone }).update({ otp_code: otp, otp_expires_at: otpExpiry });
  } else {
    await db('users').insert({ phone, name, otp_code: otp, otp_expires_at: otpExpiry });
  }

  // En prod: envoyer le SMS. En test/dev: juste logger
  if (process.env.NODE_ENV === 'production') {
    await sms.send({
      to: [phone],
      message: `Votre code SafeTrace : ${otp}. Valable 10 minutes.`,
      from: process.env.AT_SENDER_ID
    });
  } else {
    console.log(`[DEV] OTP pour ${phone} : ${otp}`);
  }

  return { message: 'OTP envoyé par SMS' };
}

async function verifyOTP({ phone, otp }) {
  const user = await db('users').where({ phone }).first();
  if (!user) throw { status: 404, message: 'Utilisateur introuvable' };
  if (user.otp_code !== otp) throw { status: 400, message: 'Code OTP incorrect' };
  if (new Date(user.otp_expires_at) < new Date()) {
    throw { status: 400, message: 'Code OTP expiré' };
  }

  const payload = { id: user.id, phone: user.phone, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  await db('users').where({ phone }).update({
    otp_code: null,
    otp_expires_at: null,
    refresh_token: refreshToken,
    is_verified: true,
    verified_at: new Date()
  });

  return { accessToken, refreshToken, user: { id: user.id, name: user.name, role: user.role } };
}

async function refresh({ refreshToken }) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw { status: 401, message: 'Refresh token invalide' };
  }
  const user = await db('users').where({ id: payload.id, refresh_token: refreshToken }).first();
  if (!user) throw { status: 401, message: 'Session révoquée' };

  const accessToken = jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  return { accessToken };
}

module.exports = { register, verifyOTP, refresh };
```

- [ ] **Étape 6 : Créer `src/modules/auth/auth.routes.js`**

```js
const router = require('express').Router();
const Joi = require('joi');
const { validate } = require('../../middleware/validate');
const authService = require('./auth.service');

const registerSchema = Joi.object({
  phone: Joi.string().pattern(/^\+237[0-9]{9}$/).required(),
  name: Joi.string().min(2).max(100).required()
});

const otpSchema = Joi.object({
  phone: Joi.string().pattern(/^\+237[0-9]{9}$/).required(),
  otp: Joi.string().length(6).required()
});

router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.json(result);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

router.post('/verify-otp', validate(otpSchema), async (req, res) => {
  try {
    const result = await authService.verifyOTP(req.body);
    res.json(result);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const result = await authService.refresh(req.body);
    res.json(result);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

module.exports = router;
```

- [ ] **Étape 7 : Monter les routes dans `src/app.js`**

```js
// Ajouter après les middlewares existants
app.use('/api/auth', require('./modules/auth/auth.routes'));
```

- [ ] **Étape 8 : Lancer les tests**

```bash
npm test -- --testPathPattern=auth.test.js
```
Résultat attendu : `PASS src/modules/auth/auth.test.js` (3 tests)

- [ ] **Étape 9 : Commit**

```bash
git add src/modules/auth/ src/config/sms.js src/db/migrations/005_add_otp_to_users.js
git commit -m "feat: add OTP auth with JWT tokens"
```

---

## Task 5 : Module Cases (signalements)

**Files:**
- Créer : `src/modules/cases/cases.routes.js`
- Créer : `src/modules/cases/cases.service.js`
- Créer : `src/modules/cases/cases.test.js`

- [ ] **Étape 1 : Écrire les tests cases**

```js
// src/modules/cases/cases.test.js
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');
const db = require('../../config/db');

process.env.JWT_SECRET = 'test_secret';

function makeToken(role = 'FAMILY') {
  return jwt.sign({ id: 'user-uuid-test', role }, 'test_secret');
}

beforeAll(() => db.migrate.latest());
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
  expect(res.body.status).toBe('PENDING');
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
  const [caseId] = await db('cases').insert({
    person_name: 'Test',
    status: 'PENDING',
    reporter_id: null
  }).returning('id');
  const res = await request(app)
    .patch(`/api/cases/${caseId}/status`)
    .set('Authorization', `Bearer ${makeToken('OFFICER')}`)
    .send({ status: 'ACTIVE' });
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ACTIVE');
});
```

- [ ] **Étape 2 : Lancer les tests — vérifier qu'ils échouent**

```bash
npm test -- --testPathPattern=cases.test.js
```
Résultat attendu : `FAIL`

- [ ] **Étape 3 : Créer `src/modules/cases/cases.service.js`**

```js
const db = require('../../config/db');

async function createCase(data, reporterId) {
  const { latitude, longitude, ...rest } = data;

  const [newCase] = await db('cases')
    .insert({
      ...rest,
      reporter_id: reporterId,
      status: 'PENDING',
      location: db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [longitude, latitude])
    })
    .returning('*');

  return newCase;
}

async function listCases({ page = 1, limit = 20, status, lat, lng, radiusKm = 50 }) {
  let query = db('cases').select('*').orderBy('created_at', 'desc');

  if (status) query = query.where({ status });

  if (lat && lng) {
    query = query.whereRaw(
      `ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)`,
      [lng, lat, radiusKm * 1000]
    );
  }

  const total = await query.clone().count('* as count').first();
  const data = await query.offset((page - 1) * limit).limit(limit);

  return { data, total: Number(total.count), page, limit };
}

async function getCaseById(id) {
  const c = await db('cases').where({ id }).first();
  if (!c) throw { status: 404, message: 'Dossier introuvable' };
  return c;
}

async function updateStatus(id, status, officerId) {
  const allowed = ['PENDING', 'ACTIVE', 'INQUIRY', 'RESOLVED'];
  if (!allowed.includes(status)) throw { status: 400, message: 'Statut invalide' };

  const [updated] = await db('cases')
    .where({ id })
    .update({ status, validated_by: officerId, updated_at: new Date() })
    .returning('*');

  if (!updated) throw { status: 404, message: 'Dossier introuvable' };
  return updated;
}

async function resolveCase(id, officerId) {
  const [updated] = await db('cases')
    .where({ id })
    .update({ status: 'RESOLVED', validated_by: officerId, resolved_at: new Date() })
    .returning('*');
  if (!updated) throw { status: 404, message: 'Dossier introuvable' };
  return updated;
}

module.exports = { createCase, listCases, getCaseById, updateStatus, resolveCase };
```

- [ ] **Étape 4 : Créer `src/modules/cases/cases.routes.js`**

```js
const router = require('express').Router();
const Joi = require('joi');
const { requireAuth, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const casesService = require('./cases.service');

const createSchema = Joi.object({
  person_name: Joi.string().min(2).max(150).required(),
  person_age: Joi.number().integer().min(0).max(120),
  person_gender: Joi.string().valid('M', 'F', 'OTHER'),
  description: Joi.string().max(2000),
  photo_url: Joi.string().uri(),
  last_seen_location: Joi.string().max(255).required(),
  last_seen_at: Joi.string().isoDate(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required()
});

router.post('/', requireAuth, validate(createSchema), async (req, res) => {
  try {
    const c = await casesService.createCase(req.body, req.user.id);
    res.status(201).json(c);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await casesService.listCases(req.query);
    res.json(result);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const c = await casesService.getCaseById(req.params.id);
    res.json(c);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

router.patch('/:id/status', requireAuth, requireRole('OFFICER', 'ADMIN'), async (req, res) => {
  try {
    const c = await casesService.updateStatus(req.params.id, req.body.status, req.user.id);
    res.json(c);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

router.post('/:id/resolve', requireAuth, requireRole('OFFICER', 'ADMIN', 'FAMILY'), async (req, res) => {
  try {
    const c = await casesService.resolveCase(req.params.id, req.user.id);
    res.json(c);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

module.exports = router;
```

- [ ] **Étape 5 : Monter dans `app.js`**

```js
app.use('/api/cases', require('./modules/cases/cases.routes'));
```

- [ ] **Étape 6 : Lancer les tests**

```bash
npm test -- --testPathPattern=cases.test.js
```
Résultat attendu : `PASS` (4 tests)

- [ ] **Étape 7 : Commit**

```bash
git add src/modules/cases/
git commit -m "feat: add cases CRUD with geospatial filtering"
```

---

## Task 6 : Module Alertes (Push + SMS)

**Files:**
- Créer : `src/config/firebase.js`
- Créer : `src/modules/alerts/alerts.service.js`
- Créer : `src/modules/alerts/alerts.test.js`

- [ ] **Étape 1 : Créer `src/config/firebase.js`**

```js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

module.exports = admin.messaging();
```

- [ ] **Étape 2 : Écrire les tests alertes (mocked)**

```js
// src/modules/alerts/alerts.test.js
jest.mock('../../config/sms', () => ({
  send: jest.fn().mockResolvedValue({ SMSMessageData: { Recipients: [{ status: 'Success' }] } })
}));
jest.mock('../../config/firebase', () => ({
  sendMulticast: jest.fn().mockResolvedValue({ successCount: 2, failureCount: 0 })
}));

const db = require('../../config/db');
const alertsService = require('./alerts.service');

beforeAll(() => db.migrate.latest());
afterAll(() => db.destroy());

test('sendAlerts — envoie push et SMS aux utilisateurs dans le rayon', async () => {
  const mockCase = {
    id: 'case-001',
    person_name: 'Kofi Mballa',
    person_age: 14,
    last_seen_location: 'Yaoundé Centre',
    latitude: 3.848,
    longitude: 11.502
  };
  const result = await alertsService.sendAlerts(mockCase);
  expect(result).toHaveProperty('push');
  expect(result).toHaveProperty('sms');
});
```

- [ ] **Étape 3 : Lancer le test — vérifier échec**

```bash
npm test -- --testPathPattern=alerts.test.js
```

- [ ] **Étape 4 : Créer `src/modules/alerts/alerts.service.js`**

```js
const db = require('../../config/db');
const sms = require('../../config/sms');
const messaging = require('../../config/firebase');

async function sendAlerts(caseData) {
  const { id: caseId, person_name, person_age, last_seen_location, latitude, longitude } = caseData;

  // Trouver les users dans un rayon de 50km
  const nearbyUsers = await db('users')
    .select('id', 'phone', 'push_token')
    .whereNotNull('push_token')
    .whereRaw(
      `ST_DWithin(
        ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
        ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
        50000
      )`,
      [longitude, latitude, longitude, latitude]
    );

  const pushTokens = nearbyUsers.map((u) => u.push_token).filter(Boolean);
  const phones = nearbyUsers.map((u) => u.phone);

  let pushResult = { successCount: 0 };
  let smsResult = { count: 0 };

  // Push notifications
  if (pushTokens.length > 0) {
    pushResult = await messaging.sendMulticast({
      tokens: pushTokens,
      notification: {
        title: `⚠ SAFETRACE ALERTE`,
        body: `${person_name}, ${person_age} ans, disparu(e) à ${last_seen_location}`
      },
      data: { caseId, type: 'MISSING_PERSON_ALERT' }
    });
    await db('alerts').insert({ case_id: caseId, channel: 'PUSH', recipients_count: pushResult.successCount });
  }

  // SMS fallback
  if (phones.length > 0 && process.env.NODE_ENV === 'production') {
    await sms.send({
      to: phones,
      message: `SAFETRACE ALERTE: ${person_name}, ${person_age} ans, disparu(e) a ${last_seen_location}. safetrace.cm/cas/${caseId}`,
      from: process.env.AT_SENDER_ID
    });
    smsResult = { count: phones.length };
    await db('alerts').insert({ case_id: caseId, channel: 'SMS', recipients_count: phones.length });
  }

  return { push: pushResult, sms: smsResult };
}

module.exports = { sendAlerts };
```

- [ ] **Étape 5 : Déclencher les alertes après création d'un cas dans `cases.routes.js`**

```js
// Ajouter en haut de cases.routes.js
const alertsService = require('../alerts/alerts.service');

// Dans POST / — après la création du cas, ajouter :
// (après res.status(201).json(c), non bloquant)
alertsService.sendAlerts({ ...c, latitude: req.body.latitude, longitude: req.body.longitude })
  .catch((err) => console.error('Alerts failed:', err));
```

- [ ] **Étape 6 : Lancer les tests**

```bash
npm test -- --testPathPattern=alerts.test.js
```
Résultat attendu : `PASS`

- [ ] **Étape 7 : Commit**

```bash
git add src/modules/alerts/ src/config/firebase.js
git commit -m "feat: add push and SMS alerts on case creation"
```

---

## Task 7 : Module Témoignages

**Files:**
- Créer : `src/modules/testimonies/testimonies.routes.js`
- Créer : `src/modules/testimonies/testimonies.service.js`
- Créer : `src/modules/testimonies/testimonies.test.js`

- [ ] **Étape 1 : Écrire les tests**

```js
// src/modules/testimonies/testimonies.test.js
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
```

- [ ] **Étape 2 : Créer `src/modules/testimonies/testimonies.service.js`**

```js
const db = require('../../config/db');

async function create({ case_id, content, photo_url, latitude, longitude }, authorId) {
  const [t] = await db('testimonies')
    .insert({
      case_id,
      author_id: authorId,
      content,
      photo_url,
      location: latitude && longitude
        ? db.raw(`ST_SetSRID(ST_MakePoint(?, ?), 4326)`, [longitude, latitude])
        : null
    })
    .returning('*');
  return t;
}

async function listByCaseId(caseId) {
  return db('testimonies').where({ case_id: caseId }).orderBy('created_at', 'desc');
}

module.exports = { create, listByCaseId };
```

- [ ] **Étape 3 : Créer `src/modules/testimonies/testimonies.routes.js`**

```js
const router = require('express').Router();
const Joi = require('joi');
const { requireAuth } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const testimonyService = require('./testimonies.service');

const schema = Joi.object({
  case_id: Joi.string().uuid().required(),
  content: Joi.string().min(5).max(2000).required(),
  photo_url: Joi.string().uri(),
  latitude: Joi.number(),
  longitude: Joi.number()
});

router.post('/', requireAuth, validate(schema), async (req, res) => {
  try {
    const t = await testimonyService.create(req.body, req.user.id);
    res.status(201).json(t);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

module.exports = router;
```

- [ ] **Étape 4 : Ajouter route GET testimonies dans `cases.routes.js`**

```js
const testimonyService = require('../testimonies/testimonies.service');

router.get('/:id/testimonies', requireAuth, async (req, res) => {
  try {
    const list = await testimonyService.listByCaseId(req.params.id);
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
```

- [ ] **Étape 5 : Monter dans `app.js`**

```js
app.use('/api/testimonies', require('./modules/testimonies/testimonies.routes'));
```

- [ ] **Étape 6 : Lancer les tests**

```bash
npm test -- --testPathPattern=testimonies.test.js
```
Résultat attendu : `PASS`

- [ ] **Étape 7 : Commit**

```bash
git add src/modules/testimonies/
git commit -m "feat: add citizen testimonies module"
```

---

## Task 8 : Module Admin (dashboard police)

**Files:**
- Créer : `src/modules/admin/admin.routes.js`
- Créer : `src/modules/admin/admin.service.js`
- Créer : `src/modules/admin/admin.test.js`

- [ ] **Étape 1 : Écrire les tests**

```js
// src/modules/admin/admin.test.js
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
```

- [ ] **Étape 2 : Créer `src/modules/admin/admin.service.js`**

```js
const db = require('../../config/db');

async function getStats() {
  const counts = await db('cases')
    .select('status')
    .count('* as count')
    .groupBy('status');

  const result = { active: 0, pending: 0, inquiry: 0, resolved: 0, total: 0 };
  counts.forEach(({ status, count }) => {
    const key = status.toLowerCase();
    result[key] = Number(count);
    result.total += Number(count);
  });

  if (result.total > 0) {
    result.resolutionRate = Math.round((result.resolved / result.total) * 100);
  } else {
    result.resolutionRate = 0;
  }

  return result;
}

async function getPendingCases() {
  return db('cases')
    .where({ status: 'PENDING' })
    .orderBy('created_at', 'asc')
    .limit(50);
}

module.exports = { getStats, getPendingCases };
```

- [ ] **Étape 3 : Créer `src/modules/admin/admin.routes.js`**

```js
const router = require('express').Router();
const { requireAuth, requireRole } = require('../../middleware/auth');
const adminService = require('./admin.service');

router.use(requireAuth, requireRole('OFFICER', 'ADMIN'));

router.get('/stats', async (req, res) => {
  try {
    res.json(await adminService.getStats());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/pending', async (req, res) => {
  try {
    res.json(await adminService.getPendingCases());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
```

- [ ] **Étape 4 : Monter dans `app.js`**

```js
app.use('/api/admin', require('./modules/admin/admin.routes'));
```

- [ ] **Étape 5 : Lancer tous les tests**

```bash
npm test
```
Résultat attendu : tous les suites PASS

- [ ] **Étape 6 : Commit final**

```bash
git add src/modules/admin/
git commit -m "feat: add admin stats and pending cases endpoints"
```

---

## Task 9 : Upload media (photos)

**Files:**
- Créer : `src/modules/media/media.routes.js`
- Créer : `src/modules/media/media.service.js`

- [ ] **Étape 1 : Créer `src/modules/media/media.service.js`**

```js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadPhoto(fileBuffer, mimeType) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'safetrace/cases', resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
      (err, result) => (err ? reject(err) : resolve({ url: result.secure_url, publicId: result.public_id }))
    );
    stream.end(fileBuffer);
  });
}

module.exports = { uploadPhoto };
```

- [ ] **Étape 2 : Créer `src/modules/media/media.routes.js`**

```js
const router = require('express').Router();
const multer = require('multer');
const { requireAuth } = require('../../middleware/auth');
const mediaService = require('./media.service');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/upload', requireAuth, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });
  try {
    const result = await mediaService.uploadPhoto(req.file.buffer, req.file.mimetype);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Échec de l\'upload' });
  }
});

module.exports = router;
```

- [ ] **Étape 3 : Monter dans `app.js`**

```js
app.use('/api/media', require('./modules/media/media.routes'));
```

- [ ] **Étape 4 : Commit**

```bash
git add src/modules/media/
git commit -m "feat: add photo upload via Cloudinary"
```

---

## Task 10 : Rate limiting + Sécurité finale

**Files:**
- Créer : `src/middleware/rateLimit.js`
- Modifier : `src/app.js`

- [ ] **Étape 1 : Créer `src/middleware/rateLimit.js`**

```js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Trop de requêtes, réessayez dans 15 minutes' }
});

const caseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3,
  message: { error: 'Maximum 3 signalements par heure' },
  keyGenerator: (req) => req.user?.id || req.ip
});

module.exports = { apiLimiter, caseLimiter };
```

- [ ] **Étape 2 : Appliquer dans `app.js`**

```js
const { apiLimiter, caseLimiter } = require('./middleware/rateLimit');

// Après les autres middlewares :
app.use('/api/', apiLimiter);
app.use('/api/cases', caseLimiter); // en plus du apiLimiter
```

- [ ] **Étape 3 : Lancer la suite complète de tests**

```bash
npm test
```
Résultat attendu : tous les suites PASS

- [ ] **Étape 4 : Commit final du Plan 1**

```bash
git add src/middleware/rateLimit.js src/app.js
git commit -m "feat: add rate limiting and finalize API security"
```

---

## Vérification finale

```bash
npm test          # Tous les tests passent
npm run dev       # Serveur démarre sur port 3000
curl localhost:3000/health   # {"status":"ok"}
```

---

*Plan 2 (App Mobile React Native) et Plan 3 (Dashboard Web Police) à créer dans les prochaines sessions.*
