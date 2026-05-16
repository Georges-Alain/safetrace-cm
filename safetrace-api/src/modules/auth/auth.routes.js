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
