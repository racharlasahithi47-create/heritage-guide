const express = require('express');
const multer = require('multer');
const path = require('path');
const { nanoid } = require('nanoid');
const db = require('../db/database');
const { classifyDamageSeverity, generateAlertMessage } = require('../services/aiStubs');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `report_${nanoid(10)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/reports/classify - step 1: upload a condition photo, get back a
// mocked severity classification (or honor demoSeverity override from the UI).
router.post('/classify', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });
  const demoSeverity = req.body.demoSeverity || null;
  const result = classifyDamageSeverity(req.file.size, demoSeverity);
  res.json({
    severity: result.severity,
    confidence: result.confidence,
    uploadedPhoto: `/uploads/${req.file.filename}`
  });
});

// POST /api/reports - step 2: submit the full report with confirmed severity.
// Auto-generates a draft ASI alert message when severity is moderate/severe.
router.post('/', (req, res) => {
  const { siteId, severity, description, photoPath, reporterName, reporterContact, sendAlert } = req.body;
  if (!siteId || !severity) return res.status(400).json({ error: 'siteId and severity are required' });

  const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(siteId);
  if (!site) return res.status(404).json({ error: 'Site not found' });

  let alertMessage = null;
  if (severity === 'moderate' || severity === 'severe') {
    alertMessage = generateAlertMessage({
      siteName: site.name,
      locationName: site.location_name,
      severity,
      description: description || 'No additional details provided.',
      reporterName,
      reporterContact
    });
  }

  const id = 'report_' + nanoid(10);
  db.prepare(
    `INSERT INTO risk_reports (id, site_id, severity, description, photo_path, reporter_name, reporter_contact, alert_message, alert_sent, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
  ).run(
    id,
    siteId,
    severity,
    description || null,
    photoPath || null,
    reporterName || null,
    reporterContact || null,
    alertMessage,
    sendAlert ? 1 : 0
  );

  const report = db.prepare('SELECT * FROM risk_reports WHERE id = ?').get(id);
  res.status(201).json({ report });
});

// GET /api/reports?status=pending - admin review queue
router.get('/', (req, res) => {
  const status = req.query.status;
  const query = `
    SELECT r.*, s.name as site_name, s.location_name as site_location
    FROM risk_reports r JOIN sites s ON r.site_id = s.id
    ${status ? 'WHERE r.status = ?' : ''}
    ORDER BY r.created_at DESC
  `;
  const reports = status ? db.prepare(query).all(status) : db.prepare(query).all();
  res.json({ reports });
});

// POST /api/reports/:id/approve - updates the site's live risk status
router.post('/:id/approve', (req, res) => {
  const report = db.prepare('SELECT * FROM risk_reports WHERE id = ?').get(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  const severityToColor = { minor: 'green', moderate: 'yellow', severe: 'red' };
  db.prepare("UPDATE risk_reports SET status = 'approved' WHERE id = ?").run(req.params.id);
  db.prepare('UPDATE sites SET risk_status = ? WHERE id = ?').run(severityToColor[report.severity], report.site_id);

  const updatedSite = db.prepare('SELECT * FROM sites WHERE id = ?').get(report.site_id);
  res.json({ report: { ...report, status: 'approved' }, updatedSite });
});

// POST /api/reports/:id/reject
router.post('/:id/reject', (req, res) => {
  const report = db.prepare('SELECT * FROM risk_reports WHERE id = ?').get(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  db.prepare("UPDATE risk_reports SET status = 'rejected' WHERE id = ?").run(req.params.id);
  res.json({ report: { ...report, status: 'rejected' } });
});

// GET /api/reports/risk-map - all sites with coords + current risk color for the public map
router.get('/risk-map/all', (req, res) => {
  const sites = db
    .prepare('SELECT id, name, location_name, latitude, longitude, risk_status, image_url FROM sites WHERE verified = 1')
    .all();
  res.json({ sites });
});

module.exports = router;
