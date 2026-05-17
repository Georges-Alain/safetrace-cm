const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/cases', require('./modules/cases/cases.routes'));

module.exports = app;
