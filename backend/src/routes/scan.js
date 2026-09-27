const express = require('express');
const multer = require('multer');
const path = require('path');
const { nanoid } = require('nanoid');
const { matchSiteFromImage } = require('../services/aiStubs');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `scan_${nanoid(10)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/scan - upload a photo, get back a matched site or "no match"
// Accepts optional `demoSiteId` field so the UI's demo-simulation dropdown
// can reliably drive the outcome (see services/aiStubs.js for real-model notes).
router.post('/', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });

  const demoSiteId = req.body.demoSiteId || null;
  const result = matchSiteFromImage(req.file.size, demoSiteId);

  res.json({
    matched: result.matched,
    confidence: result.confidence,
    site: result.site,
    uploadedPhoto: `/uploads/${req.file.filename}`
  });
});

module.exports = router;
