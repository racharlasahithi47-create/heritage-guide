const express = require('express');
const { prepareNarration, generateSiteDescription } = require('../services/aiStubs');

const router = express.Router();

// POST /api/narration - prepares narration payload for the browser's
// SpeechSynthesis API to speak (see aiStubs.js for real-TTS swap notes)
router.post('/', (req, res) => {
  const { text, language } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });
  const result = prepareNarration({ text, language: language || 'en' });
  res.json(result);
});

// POST /api/describe - mock LLM description generator for new/unseeded sites
router.post('/describe', (req, res) => {
  const { name, locationName } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const description = generateSiteDescription({ name, locationName: locationName || 'India' });
  res.json({ description });
});

module.exports = router;
