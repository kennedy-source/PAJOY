const router = require('express').Router();
const db = require('../db');
router.get('/', (_req, res) => res.json(db.prepare('SELECT * FROM sizes ORDER BY sort_order, label').all()));
module.exports = router;
