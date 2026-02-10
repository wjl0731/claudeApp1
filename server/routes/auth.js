const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');
const { generateToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', (req, res) => {
  const { phone, password, name, role } = req.body;
  if (!phone || !password || !name) {
    return res.status(400).json({ error: '请填写完整信息' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (existing) {
    return res.status(400).json({ error: '该手机号已注册' });
  }
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (phone, password, name, role) VALUES (?, ?, ?, ?)').run(phone, hash, name, role || 'user');
  const user = db.prepare('SELECT id, phone, name, role, avatar FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = generateToken(user);
  res.json({ user, token });
});

// Login
router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: '请输入手机号和密码' });
  }
  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: '手机号或密码错误' });
  }
  const { password: _, ...safeUser } = user;
  const token = generateToken(user);
  res.json({ user: safeUser, token });
});

// Get current user profile
router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, phone, name, role, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json(user);
});

module.exports = router;
