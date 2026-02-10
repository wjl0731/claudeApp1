const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, '..', 'nail_booking.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT DEFAULT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'owner')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    cover_image TEXT,
    rating REAL DEFAULT 5.0,
    is_active INTEGER DEFAULT 1,
    open_time TEXT DEFAULT '09:00',
    close_time TEXT DEFAULT '21:00',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    category TEXT DEFAULT '美甲',
    image TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    shop_id INTEGER NOT NULL REFERENCES shops(id),
    service_id INTEGER NOT NULL REFERENCES services(id),
    date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER UNIQUE NOT NULL REFERENCES appointments(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    shop_id INTEGER NOT NULL REFERENCES shops(id),
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    content TEXT,
    images TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed demo data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  const hash = bcrypt.hashSync('123456', 10);

  db.prepare(`INSERT INTO users (phone, password, name, role) VALUES (?, ?, ?, ?)`).run('13800000001', hash, '美美老师', 'owner');
  db.prepare(`INSERT INTO users (phone, password, name, role) VALUES (?, ?, ?, ?)`).run('13800000002', hash, '小樱', 'user');
  db.prepare(`INSERT INTO users (phone, password, name, role) VALUES (?, ?, ?, ?)`).run('13800000003', hash, 'Yuna', 'owner');

  db.prepare(`INSERT INTO shops (owner_id, name, description, address, phone, rating) VALUES (?, ?, ?, ?, ?, ?)`).run(
    1, 'Blooming Nail 블루밍', '韩系精致美甲 · 专注手部护理', '朝阳区三里屯路19号院', '13800000001', 4.9
  );
  db.prepare(`INSERT INTO shops (owner_id, name, description, address, phone, rating) VALUES (?, ?, ?, ?, ?, ?)`).run(
    3, 'Cherry Blossom 체리', '日韩风格 · ins风美甲设计', '海淀区中关村大街1号', '13800000003', 4.8
  );

  const services = [
    [1, '纯色美甲', '韩系纯色凝胶甲，温柔显白', 128, 45, '美甲'],
    [1, '法式美甲', '经典法式 · 优雅气质', 158, 60, '美甲'],
    [1, '手绘款式', '手绘花朵/线条艺术款', 198, 75, '美甲'],
    [1, '猫眼美甲', '极光猫眼 · 闪耀夺目', 168, 60, '美甲'],
    [1, '基础手护', '手部深层护理 + 按摩', 88, 40, '手护'],
    [2, '韩式简约款', '极简线条 · 高级感', 138, 50, '美甲'],
    [2, '晕染美甲', '水彩晕染 · 梦幻感', 188, 70, '美甲'],
    [2, '饰品款美甲', '贴钻/丝带/蝴蝶结装饰', 218, 80, '美甲'],
    [2, '卸甲 + 基础护理', '温和卸甲 + 手部滋养', 68, 30, '手护'],
  ];

  const insertService = db.prepare(`INSERT INTO services (shop_id, name, description, price, duration, category) VALUES (?, ?, ?, ?, ?, ?)`);
  for (const s of services) {
    insertService.run(...s);
  }

  // Demo appointments
  db.prepare(`INSERT INTO appointments (user_id, shop_id, service_id, date, time_slot, status) VALUES (?, ?, ?, ?, ?, ?)`).run(2, 1, 1, '2026-02-15', '14:00', 'confirmed');
  db.prepare(`INSERT INTO appointments (user_id, shop_id, service_id, date, time_slot, status, note) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(2, 2, 6, '2026-02-12', '10:30', 'completed', '想要粉色系的');

  // Demo review
  db.prepare(`INSERT INTO reviews (appointment_id, user_id, shop_id, rating, content) VALUES (?, ?, ?, ?, ?)`).run(2, 2, 2, 5, '超级好看！老师手法很温柔，下次还来～');
}

module.exports = db;
