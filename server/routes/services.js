const express = require('express');
const db = require('../database');
const { authMiddleware, ownerOnly } = require('../middleware/auth');

const router = express.Router();

// Owner: add service
router.post('/', authMiddleware, ownerOnly, (req, res) => {
  const shop = db.prepare('SELECT id FROM shops WHERE owner_id = ?').get(req.user.id);
  if (!shop) return res.status(400).json({ error: '请先创建店铺' });
  const { name, description, price, duration, category } = req.body;
  if (!name || !price) return res.status(400).json({ error: '请填写服务名称和价格' });
  const result = db.prepare('INSERT INTO services (shop_id, name, description, price, duration, category) VALUES (?,?,?,?,?,?)').run(
    shop.id, name, description, price, duration || 60, category || '美甲'
  );
  res.json(db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid));
});

// Owner: update service
router.put('/:id', authMiddleware, ownerOnly, (req, res) => {
  const shop = db.prepare('SELECT id FROM shops WHERE owner_id = ?').get(req.user.id);
  const service = db.prepare('SELECT * FROM services WHERE id = ? AND shop_id = ?').get(req.params.id, shop?.id);
  if (!service) return res.status(404).json({ error: '服务不存在' });
  const { name, description, price, duration, category, is_active } = req.body;
  db.prepare('UPDATE services SET name=?, description=?, price=?, duration=?, category=?, is_active=? WHERE id=?').run(
    name || service.name, description ?? service.description, price ?? service.price,
    duration ?? service.duration, category || service.category, is_active ?? service.is_active, service.id
  );
  res.json(db.prepare('SELECT * FROM services WHERE id = ?').get(service.id));
});

// Owner: delete service
router.delete('/:id', authMiddleware, ownerOnly, (req, res) => {
  const shop = db.prepare('SELECT id FROM shops WHERE owner_id = ?').get(req.user.id);
  const service = db.prepare('SELECT * FROM services WHERE id = ? AND shop_id = ?').get(req.params.id, shop?.id);
  if (!service) return res.status(404).json({ error: '服务不存在' });
  db.prepare('DELETE FROM services WHERE id = ?').run(service.id);
  res.json({ success: true });
});

module.exports = router;
