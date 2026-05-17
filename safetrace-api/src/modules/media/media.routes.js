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
