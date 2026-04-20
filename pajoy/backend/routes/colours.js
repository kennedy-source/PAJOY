const router = require('express').Router();
const db = require('../db');
router.get('/', (_req, res) => res.json(db.prepare('SELECT * FROM colours ORDER BY name').all()));
module.exports = router;
