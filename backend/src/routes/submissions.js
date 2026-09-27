const express = require('express');
const multer = require('multer');
const path = require('path');
const { nanoid } = require('nanoid');
const db = require('../db/database');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const prefix = file.fieldname === 'voiceNote' ? 'voice' : 'sub';
    cb(null, `${prefix}_${nanoid(10)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// POST /api/submissions - submit info about an undocumented site
router.post(
  '/',
  upload.fields([
    { name: 'photos', maxCount: 5 },
    { name: 'voiceNote', maxCount: 1 }
  ]),
  (req, res) => {
    const { siteName, locationName, latitude, longitude, description, reporterName, reporterContact } = req.body;
    if (!siteName || !locationName || !description) {
      return res.status(400).json({ error: 'siteName, locationName, and description are required' });
    }

    const photos = (req.files?.photos || []).map((f) => `/uploads/${f.filename}`);
    const voiceNote = req.files?.voiceNote?.[0] ? `/uploads/${req.files.voiceNote[0].filename}` : null;

    const id = 'sub_' + nanoid(10);
    db.prepare(
      `INSERT INTO submissions (id, site_name, location_name, latitude, longitude, description, photo_path, voice_note_path, reporter_name, reporter_contact, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    ).run(
      id,
      siteName,
      locationName,
      latitude ? Number(latitude) : null,
      longitude ? Number(longitude) : null,
      description,
      photos.join(','),
      voiceNote,
      reporterName || null,
      reporterContact || null
    );

    const submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
    res.status(201).json({ submission });
  }
);

// GET /api/submissions?status=pending - for admin review page
router.get('/', (req, res) => {
  const status = req.query.status;
  const submissions = status
    ? db.prepare('SELECT * FROM submissions WHERE status = ? ORDER BY created_at DESC').all(status)
    : db.prepare('SELECT * FROM submissions ORDER BY created_at DESC').all();
  res.json({ submissions });
});

// POST /api/submissions/:id/approve - becomes a searchable/verified site
router.post('/:id/approve', (req, res) => {
  const submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(req.params.id);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });

  const siteId = 'site_' + nanoid(10);
  const firstPhoto = submission.photo_path ? submission.photo_path.split(',')[0] : null;

  db.prepare(
    `INSERT INTO sites (id, name, short_description, long_description, era, location_name, latitude, longitude, image_url, risk_status, verified)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'green', 1)`
  ).run(
    siteId,
    submission.site_name,
    submission.description.slice(0, 140),
    submission.description,
    'Community documented',
    submission.location_name,
    submission.latitude || 0,
    submission.longitude || 0,
    firstPhoto || 'https://commons.wikimedia.org/wiki/Special:FilePath/Heritage%20site%20placeholder.jpg'
  );

  db.prepare("UPDATE submissions SET status = 'approved' WHERE id = ?").run(req.params.id);
  const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(siteId);
  res.json({ submission: { ...submission, status: 'approved' }, newSite: site });
});

// POST /api/submissions/:id/reject
router.post('/:id/reject', (req, res) => {
  const submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(req.params.id);
  if (!submission) return res.status(404).json({ error: 'Submission not found' });
  db.prepare("UPDATE submissions SET status = 'rejected' WHERE id = ?").run(req.params.id);
  res.json({ submission: { ...submission, status: 'rejected' } });
});

module.exports = router;
