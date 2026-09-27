const express = require('express');
const db = require('../db/database');

const router = express.Router();

// GET /api/sites - all verified sites (Explore page + Home grid)
router.get('/', (req, res) => {
  const { q, risk } = req.query;
  let query = 'SELECT * FROM sites WHERE verified = 1';
  const params = [];

  if (q) {
    query += ' AND (name LIKE ? OR location_name LIKE ? OR short_description LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  if (risk && ['green', 'yellow', 'red'].includes(risk)) {
    query += ' AND risk_status = ?';
    params.push(risk);
  }
  query += ' ORDER BY name ASC';

  const sites = db.prepare(query).all(...params);
  res.json({ sites });
});

// GET /api/sites/meta/stats - home screen stat banner (must be defined before /:id)
router.get('/meta/stats', (req, res) => {
  const sitesCount = db.prepare('SELECT COUNT(*) as c FROM sites WHERE verified = 1').get().c;
  const reportsCount = db.prepare('SELECT COUNT(*) as c FROM risk_reports WHERE status = ?').get('approved').c;
  const watchCount = db
    .prepare("SELECT COUNT(*) as c FROM sites WHERE risk_status IN ('yellow', 'red') AND verified = 1")
    .get().c;
  res.json({
    sitesDocumented: sitesCount,
    reportsFiled: reportsCount,
    sitesUnderWatch: watchCount
  });
});

// GET /api/sites/:id
router.get('/:id', (req, res) => {
  const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(req.params.id);
  if (!site) return res.status(404).json({ error: 'Site not found' });

  const nearby = db
    .prepare(
      `SELECT id, name, latitude, longitude, image_url, risk_status FROM sites
       WHERE id != ? AND verified = 1
       ORDER BY ((latitude - ?) * (latitude - ?) + (longitude - ?) * (longitude - ?)) ASC
       LIMIT 4`
    )
    .all(site.id, site.latitude, site.latitude, site.longitude, site.longitude);

  res.json({ site, nearby });
});

module.exports = router;
