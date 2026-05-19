const router = require('express').Router();
const Joi = require('joi');
const { requireAuth, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { caseLimiter } = require('../../middleware/rateLimit');
const casesService = require('./cases.service');
const reactionsService = require('../reactions/reactions.service');

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

router.post('/', requireAuth, caseLimiter, validate(createSchema), async (req, res) => {
  try {
    const c = await casesService.createCase(req.body, req.user.id);
    res.status(201).json(c);
    const alertsService = require('../alerts/alerts.service');
    alertsService.sendAlerts({ ...c, latitude: req.body.latitude, longitude: req.body.longitude })
      .catch((err) => console.error('Alerts failed:', err));
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

router.get('/:id/testimonies', requireAuth, async (req, res) => {
  try {
    const testimonyService = require('../testimonies/testimonies.service');
    const list = await testimonyService.listByCaseId(req.params.id);
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/react', requireAuth, async (req, res) => {
  try {
    const result = await reactionsService.toggleReaction(req.params.id, req.user.id);
    res.json(result);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

module.exports = router;
