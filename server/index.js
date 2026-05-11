require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data.sqlite');

// Ensure db dir
const dbDir = path.dirname(DB_FILE);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new sqlite3.Database(DB_FILE);

// Initialize tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS guests (
    id TEXT PRIMARY KEY,
    nome TEXT,
    email TEXT,
    telefone TEXT,
    acompanha INTEGER,
    restricoes TEXT,
    mesa_id TEXT,
    qr_code TEXT,
    created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tables (
    id TEXT PRIMARY KEY,
    name TEXT,
    capacity INTEGER
  )`);
});

// Ensure checkin columns exist (SQLite doesn't support IF NOT EXISTS for columns)
db.serialize(() => {
  db.all(`PRAGMA table_info(guests)`, [], (err, cols) => {
    if (err) return console.error('PRAGMA error', err);
    const names = cols.map(c => c.name);
    if (!names.includes('checked_in')) {
      db.run(`ALTER TABLE guests ADD COLUMN checked_in INTEGER DEFAULT 0`);
    }
    if (!names.includes('checkin_time')) {
      db.run(`ALTER TABLE guests ADD COLUMN checkin_time TEXT DEFAULT NULL`);
    }
  });
});

const app = express();
app.use(cors());
app.use(express.json());

// Serve static (optional)
app.use('/static', express.static(path.join(__dirname, 'static')));

// Create RSVP
app.post('/api/rsvp', async (req, res) => {
  try {
    const { nome, email, telefone, acompanha, restricoes } = req.body;
    if (!nome || !email) return res.status(400).json({ error: 'nome and email required' });
    const id = uuidv4();
    const created_at = new Date().toISOString();
    const qrPayload = { id };
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload));

    db.run(
      `INSERT INTO guests (id,nome,email,telefone,acompanha,restricoes,qr_code,created_at) VALUES (?,?,?,?,?,?,?,?)`,
      [id, nome, email, telefone || null, acompanha ? 1 : 0, restricoes || null, qrCodeDataUrl, created_at],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ id, qr: qrCodeDataUrl });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Get guest by id
app.get('/api/guest/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM guests WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(row);
  });
});

// List guests
app.get('/api/guests', (req, res) => {
  db.all(`SELECT * FROM guests ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Tables management
app.post('/api/tables', (req, res) => {
  const { name, capacity } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = uuidv4();
  db.run(`INSERT INTO tables (id,name,capacity) VALUES (?,?,?)`, [id, name, capacity || 0], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, name, capacity: capacity || 0 });
  });
});

app.get('/api/tables', (req, res) => {
  db.all(`SELECT * FROM tables`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Assign guest to table
app.post('/api/guests/:id/assign', (req, res) => {
  const { id } = req.params;
  const { table_id } = req.body;
  db.run(`UPDATE guests SET mesa_id = ? WHERE id = ?`, [table_id || null, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

// Update guest fields
app.patch('/api/guests/:id', (req, res) => {
  const { id } = req.params;
  const allowed = ['nome', 'email', 'telefone', 'acompanha', 'restricoes', 'mesa_id'];
  const updates = [];
  const values = [];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      updates.push(`${key} = ?`);
      values.push(req.body[key]);
    }
  }
  if (updates.length === 0) return res.status(400).json({ error: 'no fields' });
  values.push(id);
  const sql = `UPDATE guests SET ${updates.join(', ')} WHERE id = ?`;
  db.run(sql, values, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

app.delete('/api/guests/:id', checkAdmin, (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM guests WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

// Checkin endpoint (mark present/unpresent)
app.post('/api/guests/:id/checkin', checkAdmin, (req, res) => {
  const { id } = req.params;
  const { present } = req.body;
  const time = present ? new Date().toISOString() : null;
  const val = present ? 1 : 0;
  db.run(`UPDATE guests SET checked_in = ?, checkin_time = ? WHERE id = ?`, [val, time, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

// Update table
app.patch('/api/tables/:id', (req, res) => {
  const { id } = req.params;
  const { name, capacity } = req.body;
  db.run(`UPDATE tables SET name = COALESCE(?, name), capacity = COALESCE(?, capacity) WHERE id = ?`, [name, capacity, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ ok: true });
  });
});

app.delete('/api/tables/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM tables WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    // unset mesa_id for guests assigned to this table
    db.run(`UPDATE guests SET mesa_id = NULL WHERE mesa_id = ?`, [id], function () {});
    res.json({ ok: true });
  });
});

// Export guests as CSV (simple)
app.get('/api/export', (req, res) => {
  db.all(`SELECT * FROM guests ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const header = ['id','nome','email','telefone','acompanha','restricoes','mesa_id','created_at'];
    const csv = [header.join(',')].concat(rows.map(r => header.map(h => `"${String(r[h] ?? '')}"`).join(','))).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="guests.csv"');
    res.send(csv);
  });
});

// Simple admin auth placeholder (for demo only)
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const ADMIN_PASS = process.env.ADMIN_PASS || 'changeme';
  if (password === ADMIN_PASS) return res.json({ ok: true, token: 'demo-token' });
  return res.status(401).json({ error: 'unauthorized' });
});

// simple admin check middleware
function checkAdmin(req, res, next) {
  const header = req.headers['x-admin-token'] || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  const ADMIN_PASS = process.env.ADMIN_PASS || 'changeme';
  if (!header) return res.status(401).json({ error: 'missing token' });
  if (header === 'demo-token' || header === ADMIN_PASS) return next();
  return res.status(403).json({ error: 'forbidden' });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
