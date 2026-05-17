const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { apiLimiter, caseLimiter } = require('./middleware/rateLimit');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api/', apiLimiter);

app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/cases', caseLimiter, require('./modules/cases/cases.routes'));
app.use('/api/testimonies', require('./modules/testimonies/testimonies.routes'));
app.use('/api/admin', require('./modules/admin/admin.routes'));
app.use('/api/media', require('./modules/media/media.routes'));

module.exports = app;
