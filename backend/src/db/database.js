const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'heritage.sqlite');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_description TEXT NOT NULL,
      long_description TEXT NOT NULL,
      era TEXT,
      location_name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      image_url TEXT NOT NULL,
      risk_status TEXT NOT NULL DEFAULT 'green', -- green | yellow | red
      verified INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      site_name TEXT NOT NULL,
      location_name TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      description TEXT NOT NULL,
      photo_path TEXT,
      voice_note_path TEXT,
      reporter_name TEXT,
      reporter_contact TEXT,
      status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS risk_reports (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL,
      severity TEXT NOT NULL, -- minor | moderate | severe
      description TEXT,
      photo_path TEXT,
      reporter_name TEXT,
      reporter_contact TEXT,
      alert_message TEXT,
      alert_sent INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (site_id) REFERENCES sites(id)
    );
  `);
}

initSchema();

module.exports = db;
