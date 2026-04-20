const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, dbPath: db.dbPath, ts: Date.now() });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/schools', require('./routes/schools'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/sizes', require('./routes/sizes'));
app.use('/api/colours', require('./routes/colours'));
app.use('/api/products', require('./routes/products'));
app.use('/api/variants', require('./routes/variants'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/embroidery', require('./routes/embroidery'));
app.use('/api/mpesa', require('./routes/mpesa'));
app.use('/api/printing', require('./routes/printing'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/suppliers', require('./routes/suppliers'));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal error' });
});

const PORT = process.env.PAJOY_PORT || 5179;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[PAJOY] backend on http://127.0.0.1:${PORT}  db=${db.dbPath}`);
});
