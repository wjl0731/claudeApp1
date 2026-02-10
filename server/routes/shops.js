const express = require('express');
const { authMiddleware, ownerOnly } = require('../middleware/auth');

const router = express.Router();

// List all active shops (public)
router.get('/', (req, res) => {
  const db = req.db;
  const shops = db.prepare(`
    SELECT s.*, u.name as owner_name,
      (SELECT COUNT(*) FROM reviews r WHERE r.shop_id = s.id) as review_count
    FROM shops s JOIN users u ON s.owner_id = u.id
    WHERE s.is_active = 1
    ORDER BY s.rating DESC
  `).all();
  res.json(shops);
});

// Owner: get my shop (must be before /:id to avoid conflict)
router.get('/owner/mine', authMiddleware, ownerOnly, (req, res) => {
  const db = req.db;
  const shop = db.prepare('SELECT * FROM shops WHERE owner_id = ?').get(req.user.id);
  if (!shop) {
    return res.json(null);
  }
  const services = db.prepare('SELECT * FROM services WHERE shop_id = ? ORDER BY category, price').all(shop.id);
  res.json({ ...shop, services });
});

// Get single shop with services (public)
router.get('/:id', (req, res) => {
  const db = req.db;
  const shop = db.prepare(`
    SELECT s.*, u.name as owner_name FROM shops s JOIN users u ON s.owner_id = u.id WHERE s.id = ?
  `).get(req.params.id);
  if (!shop) return res.status(404).json({ error: '店铺不存在' });

  const services = db.prepare('SELECT * FROM services WHERE shop_id = ? AND is_active = 1 ORDER BY category, price').all(req.params.id);
  const reviews = db.prepare(`
    SELECT r.*, u.name as user_name, u.avatar as user_avatar
    FROM reviews r JOIN users u ON r.user_id = u.id
    WHERE r.shop_id = ? ORDER BY r.created_at DESC LIMIT 20
  `).all(req.params.id);

  res.json({ ...shop, services, reviews });
});

// Owner: create shop
router.post('/', authMiddleware, ownerOnly, (req, res) => {
  const db = req.db;
  const { name, description, address, phone, open_time, close_time } = req.body;
  const existing = db.prepare('SELECT id FROM shops WHERE owner_id = ?').get(req.user.id);
  if (existing) return res.status(400).json({ error: '您已有店铺' });
  const result = db.prepare('INSERT INTO shops (owner_id, name, description, address, phone, open_time, close_time) VALUES (?,?,?,?,?,?,?)').run(
    req.user.id, name, description, address, phone, open_time || '09:00', close_time || '21:00'
  );
  const shop = db.prepare('SELECT * FROM shops WHERE id = ?').get(result.lastInsertRowid);
  db.save();
  res.json(shop);
});

// Owner: update shop
router.put('/:id', authMiddleware, ownerOnly, (req, res) => {
  const db = req.db;
  const shop = db.prepare('SELECT * FROM shops WHERE id = ? AND owner_id = ?').get(req.params.id, req.user.id);
  if (!shop) return res.status(404).json({ error: '店铺不存在' });
  const { name, description, address, phone, open_time, close_time } = req.body;
  db.prepare('UPDATE shops SET name=?, description=?, address=?, phone=?, open_time=?, close_time=? WHERE id=?').run(
    name || shop.name, description ?? shop.description, address || shop.address, phone || shop.phone, open_time || shop.open_time, close_time || shop.close_time, shop.id
  );
  db.save();
  res.json(db.prepare('SELECT * FROM shops WHERE id = ?').get(shop.id));
});

module.exports = router;
