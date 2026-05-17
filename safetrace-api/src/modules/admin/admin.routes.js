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
