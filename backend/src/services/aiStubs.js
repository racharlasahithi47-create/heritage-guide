/**
 * ============================================================================
 * MOCKED AI SERVICE LAYER
 * ============================================================================
 * Every function in this file is a clearly-marked placeholder standing in for
 * a real AI/ML integration. Each one documents exactly what real service
 * should replace it and what the expected input/output contract is, so a
 * future engineer can swap in a live model with minimal refactoring.
 * ============================================================================
 */

const db = require('../db/database');

/**
 * STUB: Image-based heritage site matching.
 * REAL IMPLEMENTATION: Send the uploaded image to a vision model / embedding
 * search (e.g. CLIP-style embedding + nearest neighbour lookup against a
 * verified-sites image index, or a multimodal LLM vision call) to identify
 * which documented site (if any) the photo depicts.
 *
 * @param {Buffer} imageBuffer - the uploaded photo
 * @param {string|null} demoSiteId - optional override used by the demo UI's
 *   "simulate match" dropdown so the flow is reliably demoable without a real
 *   model. If provided and valid, we short-circuit to that site.
 * @returns {{ matched: boolean, site: object|null, confidence: number }}
 */
function matchSiteFromImage(imageBuffer, demoSiteId) {
  const allSites = db.prepare('SELECT * FROM sites WHERE verified = 1').all();

  if (demoSiteId === 'no_match') {
    return { matched: false, site: null, confidence: 0 };
  }

  if (demoSiteId) {
    const chosen = allSites.find((s) => s.id === demoSiteId);
    if (chosen) {
      return { matched: true, site: chosen, confidence: 0.94 };
    }
  }

  // Fallback pseudo-random behaviour keyed off the image size, purely so the
  // "no demo selection made" path still produces varied, semi-deterministic
  // results during manual testing.
  const size = typeof imageBuffer === 'number' ? imageBuffer : imageBuffer?.length;
  const seed = (size || Date.now()) % 100;
  if (seed < 15) {
    return { matched: false, site: null, confidence: 0 };
  }
  const index = seed % allSites.length;
  return { matched: true, site: allSites[index], confidence: 0.7 + (seed % 25) / 100 };
}

/**
 * STUB: LLM-generated site description.
 * REAL IMPLEMENTATION: Call an LLM (e.g. Claude via the Anthropic API) with a
 * prompt containing the site name/location and any known facts, asking for a
 * verified, cited historical summary. For now we return the curated seeded
 * description, or a generic templated blurb for unseeded/new sites.
 *
 * @param {object} params - { name, locationName }
 * @returns {string} description text
 */
function generateSiteDescription({ name, locationName }) {
  const existing = db.prepare('SELECT long_description FROM sites WHERE name = ?').get(name);
  if (existing) return existing.long_description;
  return `${name} is a heritage site located in ${locationName}. A detailed, verified history for this site has not yet been generated — once documented and reviewed, this description will be enriched with confirmed historical detail.`;
}

/**
 * STUB: Text-to-speech narration.
 * REAL IMPLEMENTATION: Call a TTS API (e.g. ElevenLabs, Google Cloud TTS, or
 * Amazon Polly) with the description text and selected language/voice, and
 * return an audio URL or stream. For this prototype, narration audio is
 * generated entirely client-side using the browser's built-in
 * SpeechSynthesis API (see frontend `useNarration` hook), so this server
 * stub simply echoes back the text + language that would be sent to a real
 * TTS provider.
 *
 * @param {object} params - { text, language }
 * @returns {{ text: string, language: string, provider: string }}
 */
function prepareNarration({ text, language }) {
  return { text, language, provider: 'browser-speech-synthesis (mock; swap for ElevenLabs/Polly/Google TTS)' };
}

/**
 * STUB: Image-based damage/severity classification.
 * REAL IMPLEMENTATION: Send the uploaded condition photo to a fine-tuned
 * vision classification model trained on categories of structural damage,
 * graffiti, encroachment, and vegetation overgrowth, returning a severity
 * label with confidence.
 *
 * @param {Buffer} imageBuffer
 * @param {string|null} demoSeverity - optional override from the report
 *   flow's "simulate classification" dropdown, so the demo is reliable.
 * @returns {{ severity: 'minor'|'moderate'|'severe', confidence: number }}
 */
function classifyDamageSeverity(imageBuffer, demoSeverity) {
  const valid = ['minor', 'moderate', 'severe'];
  if (demoSeverity && valid.includes(demoSeverity)) {
    return { severity: demoSeverity, confidence: 0.9 };
  }
  const size = typeof imageBuffer === 'number' ? imageBuffer : imageBuffer?.length;
  const seed = (size || Date.now()) % 100;
  let severity = 'minor';
  if (seed >= 66) severity = 'severe';
  else if (seed >= 33) severity = 'moderate';
  return { severity, confidence: 0.6 + (seed % 30) / 100 };
}

/**
 * Generates a formatted draft alert message addressed to the Local ASI
 * Circle Office. This is plain templating today; a real implementation could
 * ask an LLM to phrase this more formally / translate it, but the structured
 * facts should always come from verified report data, not model invention.
 */
function generateAlertMessage({ siteName, locationName, severity, description, reporterName, reporterContact }) {
  const severityLabel = severity.charAt(0).toUpperCase() + severity.slice(1);
  return [
    `To: Local ASI Circle Office`,
    `Subject: Heritage Condition Alert — ${siteName} (${severityLabel})`,
    ``,
    `Site: ${siteName}`,
    `Location: ${locationName}`,
    `Severity: ${severityLabel}`,
    `Description: ${description}`,
    `Reported by: ${reporterName || 'Anonymous'}${reporterContact ? ` (${reporterContact})` : ''}`,
    ``,
    `This alert was generated via the Heritage Guide crowdsourced condition-reporting flow and is pending review before official dispatch.`
  ].join('\n');
}

module.exports = {
  matchSiteFromImage,
  generateSiteDescription,
  prepareNarration,
  classifyDamageSeverity,
  generateAlertMessage
};
