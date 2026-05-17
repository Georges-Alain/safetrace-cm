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
