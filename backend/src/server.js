const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

require('./db/seed'); // ensures DB is seeded on first run

const sitesRouter = require('./routes/sites');
const scanRouter = require('./routes/scan');
const submissionsRouter = require('./routes/submissions');
const reportsRouter = require('./routes/reports');
const narrationRouter = require('./routes/narration');

const app = express();
const PORT = process.env.PORT || 4000;

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.use('/api/sites', sitesRouter);
app.use('/api/scan', scanRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/narration', narrationRouter);

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'heritage-guide-backend' }));

app.listen(PORT, () => {
  console.log(`\n🪔  Heritage Guide backend running at http://localhost:${PORT}\n`);
});
