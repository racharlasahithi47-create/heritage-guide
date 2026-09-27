# 🛕 Heritage Guide

An AI-powered cultural heritage companion — scan a monument to learn its verified
history, discover sites nearby, and help protect India's heritage through
crowdsourced condition reporting.

This is a fully working clickable prototype. The four AI-dependent pieces
(site image-matching, damage/severity classification, LLM descriptions, and
text-to-speech) are implemented as clearly-labeled **mock/stub functions** in
`backend/src/services/aiStubs.js`, wired up with demo-simulation dropdowns in
the UI so every flow works end-to-end without a live model. Narration itself
actually works for real, using the browser's built-in SpeechSynthesis API.

## Project structure

```
heritage-guide/
├── backend/          Node/Express API + SQLite database
│   └── src/
│       ├── db/            database.js (schema) + seed.js (5 sample sites)
│       ├── routes/         sites, scan, submissions, reports, narration
│       └── services/       aiStubs.js — all mocked AI functions, clearly documented
└── frontend/          React (Vite) app, mobile-first
    └── src/
        ├── pages/          Home, Scan, Result, SiteDetail, ReportFlow, Explore, RiskMap, Admin
        ├── components/     shared UI (cards, badges, map, icons, nav)
        └── hooks/          useNarration (real browser TTS)
```

## Requirements

- Node.js 18+ (recommended: Node 20)
- npm

## 1. Install & run the backend

```bash
cd backend
npm install
npm start
```

This starts the API at **http://localhost:4000** and automatically creates
and seeds a local SQLite database (`backend/src/db/heritage.sqlite`) with 5
sample sites (Golconda Fort, Charminar, Ramappa Temple, Ajanta Caves, Hampi),
a couple of demo risk reports, and one pending site submission — so the app
looks populated immediately.

Use `npm run dev` instead if you'd like auto-restart on file changes
(requires the `nodemon` dev dependency, already listed in `package.json`).

## 2. Install & run the frontend

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

This starts the app at **http://localhost:5173**. The Vite dev server proxies
`/api` and `/uploads` requests to the backend on port 4000, so just open
http://localhost:5173 in your browser (or on your phone via your machine's
local network IP, since the "Scan a Monument" camera flow is meant to be used
on-site with a phone).

## 3. Try it out

- **Home** → tap "Scan a Monument"
- **Scan** → take/upload a photo, optionally pick a "demo mode" result from
  the dropdown (since image matching is mocked), then "Identify This Monument"
- **Result** → see the verified badge, description, play narration in
  English/Hindi/Telugu, view nearby sites on the map, or tap "Report Condition"
- **Report Condition** → upload a condition photo, pick a demo severity (or
  Auto), review the severity badge, and — for Moderate/Severe — review and
  "send" an auto-drafted alert to the Local ASI Circle Office
- **Explore** → search/filter all verified sites
- **Risk Map** → see every site color-coded by current risk status
- **Review (Admin)** → approve/reject pending new-site submissions and risk
  reports; approvals update what the public sees on Explore and the Risk Map

## Swapping in real AI services later

Every mock lives in `backend/src/services/aiStubs.js` with a doc-comment
describing exactly what real service should replace it:

- `matchSiteFromImage` → vision embedding search / multimodal LLM vision call
- `generateSiteDescription` → LLM call (e.g. Claude) for verified, cited history
- `prepareNarration` → real TTS provider (ElevenLabs / Google Cloud TTS / Polly)
- `classifyDamageSeverity` → fine-tuned image classification model

No other application code should need to change — the routes already call
these functions and just need their internals swapped for real API calls.

## Notes

- Uploaded photos are stored in `backend/uploads/` and served at `/uploads/...`.
- The map (site detail preview + full Risk Map) uses OpenStreetMap tiles via
  Leaflet, which requires an internet connection to load map tiles.
- Sample site photos link to Wikimedia Commons; if any specific image URL
  doesn't resolve, the UI gracefully falls back to an on-theme illustrated
  placeholder rather than a broken image icon.
