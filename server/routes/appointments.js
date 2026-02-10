const express = require('express');
const { authMiddleware, ownerOnly } = require('../middleware/auth');

const router = express.Router();

// User: create appointment
router.post('/', authMiddleware, (req, res) => {
  const db = req.db;
  const { shop_id, service_id, date, time_slot, note } = req.body;
  if (!shop_id || !service_id || !date || !time_slot) {
    return res.status(400).json({ error: '请选择完整预约信息' });
  }
  const conflict = db.prepare(
    `SELECT id FROM appointments WHERE shop_id = ? AND date = ? AND time_slot = ? AND status IN ('pending','confirmed')`
  ).get(shop_id, date, time_slot);
  if (conflict) {
    return res.status(400).json({ error: '该时段已被预约，请选择其他时间' });
  }
  const result = db.prepare(
    'INSERT INTO appointments (user_id, shop_id, service_id, date, time_slot, note) VALUES (?,?,?,?,?,?)'
  ).run(req.user.id, shop_id, service_id, date, time_slot, note || null);
  const appt = db.prepare(`
    SELECT a.*, s.name as service_name, s.price, s.duration, sh.name as shop_name
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    JOIN shops sh ON a.shop_id = sh.id
    WHERE a.id = ?
  `).get(result.lastInsertRowid);
  db.save();
  res.json(appt);
});

// User: get my appointments
router.get('/mine', authMiddleware, (req, res) => {
  const db = req.db;
  const appointments = db.prepare(`
    SELECT a.*, s.name as service_name, s.price, s.duration, sh.name as shop_name, sh.address as shop_address,
      (SELECT COUNT(*) FROM reviews r WHERE r.appointment_id = a.id) as has_review
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    JOIN shops sh ON a.shop_id = sh.id
    WHERE a.user_id = ?
    ORDER BY a.date DESC, a.time_slot DESC
  `).all(req.user.id);
  res.json(appointments);
});

// Owner: get shop appointments
router.get('/shop', authMiddleware, ownerOnly, (req, res) => {
  const db = req.db;
  const shop = db.prepare('SELECT id FROM shops WHERE owner_id = ?').get(req.user.id);
  if (!shop) return res.json([]);
  const { date, status } = req.query;
  let query = `
    SELECT a.*, s.name as service_name, s.price, s.duration, u.name as user_name, u.phone as user_phone
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    JOIN users u ON a.user_id = u.id
    WHERE a.shop_id = ?
  `;
  const params = [shop.id];
  if (date) { query += ' AND a.date = ?'; params.push(date); }
  if (status) { query += ' AND a.status = ?'; params.push(status); }
  query += ' ORDER BY a.date ASC, a.time_slot ASC';
  res.json(db.prepare(query).all(...params));
});

// Owner: update appointment status
router.put('/:id/status', authMiddleware, ownerOnly, (req, res) => {
  const db = req.db;
  const shop = db.prepare('SELECT id FROM shops WHERE owner_id = ?').get(req.user.id);
  const appt = db.prepare('SELECT * FROM appointments WHERE id = ? AND shop_id = ?').get(req.params.id, shop?.id);
  if (!appt) return res.status(404).json({ error: '预约不存在' });
  const { status } = req.body;
  if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: '无效状态' });
  }
  db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, appt.id);
  db.save();
  res.json({ ...appt, status });
});

// User: cancel appointment
router.put('/:id/cancel', authMiddleware, (req, res) => {
  const db = req.db;
  const appt = db.prepare('SELECT * FROM appointments WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!appt) return res.status(404).json({ error: '预约不存在' });
  if (appt.status === 'completed') return res.status(400).json({ error: '已完成的预约无法取消' });
  db.prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?").run(appt.id);
  db.save();
  res.json({ ...appt, status: 'cancelled' });
});

// User: add review
router.post('/:id/review', authMiddleware, (req, res) => {
  const db = req.db;
  const appt = db.prepare("SELECT * FROM appointments WHERE id = ? AND user_id = ? AND status = 'completed'").get(req.params.id, req.user.id);
  if (!appt) return res.status(400).json({ error: '只能评价已完成的预约' });
  const existing = db.prepare('SELECT id FROM reviews WHERE appointment_id = ?').get(appt.id);
  if (existing) return res.status(400).json({ error: '已评价过' });
  const { rating, content } = req.body;
  db.prepare('INSERT INTO reviews (appointment_id, user_id, shop_id, rating, content) VALUES (?,?,?,?,?)').run(
    appt.id, req.user.id, appt.shop_id, rating || 5, content
  );
  const avg = db.prepare('SELECT AVG(rating) as avg_rating FROM reviews WHERE shop_id = ?').get(appt.shop_id);
  db.prepare('UPDATE shops SET rating = ? WHERE id = ?').run(Math.round(avg.avg_rating * 10) / 10, appt.shop_id);
  db.save();
  res.json({ success: true });
});

// Get available time slots for a shop on a date
router.get('/slots', (req, res) => {
  const db = req.db;
  const { shop_id, date } = req.query;
  if (!shop_id || !date) return res.status(400).json({ error: '缺少参数' });
  const shop = db.prepare('SELECT open_time, close_time FROM shops WHERE id = ?').get(shop_id);
  if (!shop) return res.status(404).json({ error: '店铺不存在' });

  const booked = db.prepare(
    `SELECT time_slot FROM appointments WHERE shop_id = ? AND date = ? AND status IN ('pending','confirmed')`
  ).all(shop_id, date).map(r => r.time_slot);

  const slots = [];
  const [openH, openM] = shop.open_time.split(':').map(Number);
  const [closeH, closeM] = shop.close_time.split(':').map(Number);
  let h = openH, m = openM;
  while (h < closeH || (h === closeH && m < closeM)) {
    const slot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    slots.push({ time: slot, available: !booked.includes(slot) });
    m += 30;
    if (m >= 60) { h++; m = 0; }
  }
  res.json(slots);
});

module.exports = router;
