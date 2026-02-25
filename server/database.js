const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'ai_workflow.db');

class DatabaseWrapper {
  constructor(sqlDb) {
    this._db = sqlDb;
  }

  exec(sql) {
    this._db.run(sql);
  }

  prepare(sql) {
    const db = this._db;
    return {
      run(...params) {
        db.run(sql, params);
        const lastId = db.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0];
        return { lastInsertRowid: lastId, changes: db.getRowsModified() };
      },
      get(...params) {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) {
          const cols = stmt.getColumnNames();
          const vals = stmt.get();
          stmt.free();
          const row = {};
          cols.forEach((c, i) => { row[c] = vals[i]; });
          return row;
        }
        stmt.free();
        return undefined;
      },
      all(...params) {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const cols = stmt.getColumnNames();
        const rows = [];
        while (stmt.step()) {
          const vals = stmt.get();
          const row = {};
          cols.forEach((c, i) => { row[c] = vals[i]; });
          rows.push(row);
        }
        stmt.free();
        return rows;
      }
    };
  }

  save() {
    const data = this._db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

let dbInstance = null;

async function getDb() {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();

  let sqlDb;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    sqlDb = new SQL.Database(fileBuffer);
  } else {
    sqlDb = new SQL.Database();
  }

  const db = new DatabaseWrapper(sqlDb);

  db.exec(`
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT '🎯',
      category TEXT DEFAULT '通用',
      nodes TEXT NOT NULL DEFAULT '[]',
      prompt_template TEXT DEFAULT '',
      use_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed example skills if empty
  const skillCount = db.prepare('SELECT COUNT(*) as count FROM skills').get().count;
  if (skillCount === 0) {
    const insertSkill = db.prepare(
      'INSERT INTO skills (name, description, icon, category, nodes, use_count) VALUES (?, ?, ?, ?, ?, ?)'
    );

    insertSkill.run(
      '泳装写真工作流',
      '为泳装摄影生成专业AI绘图提示词，包含性别、场景、风格等完整配置',
      '🏊',
      '摄影',
      JSON.stringify([
        { id: 's1_n1', type: 'select', label: '人物性别', description: '选择拍摄对象的性别', options: ['女生', '男生', '情侣'], required: true },
        { id: 's1_n2', type: 'select', label: '泳装颜色', description: '选择泳装的主要颜色', options: ['黑色', '白色', '红色', '蓝色', '花纹/印花', '荧光色', '随机'], required: false },
        { id: 's1_n3', type: 'select', label: '拍摄场景', description: '选择主要拍摄场景', options: ['海边沙滩', '室外泳池', '室内泳池', '热带度假村', '游艇甲板'], required: true },
        { id: 's1_n4', type: 'multi-select', label: '风格偏好', description: '选择照片风格（可多选）', options: ['清爽活力', '性感魅力', '休闲度假', '运动竞技', '时尚大片'], required: false },
        { id: 's1_n5', type: 'select', label: '生成数量', description: '希望生成几张图片', options: ['1张', '3张', '5张', '10张'], required: true },
        { id: 's1_n6', type: 'textarea', label: '其他要求', description: '输入额外的特殊要求（如服装细节、表情、道具等）', placeholder: '例如：穿着白色比基尼，背对镜头，阳光照射效果...', required: false }
      ]),
      12
    );

    insertSkill.run(
      '旅行攻略工作流',
      '根据个人偏好和预算，生成定制化的详细旅行攻略',
      '✈️',
      '旅行',
      JSON.stringify([
        { id: 's2_n1', type: 'text', label: '目的地', description: '输入旅行目的地（城市或国家）', placeholder: '例如：日本东京、泰国清迈...', required: true },
        { id: 's2_n2', type: 'select', label: '旅行天数', description: '计划旅行的天数', options: ['3天以内', '4-5天', '6-7天', '1-2周', '2周以上'], required: true },
        { id: 's2_n3', type: 'select', label: '预算范围', description: '人均旅行预算', options: ['经济实惠 (<3000元)', '中等 (3000-8000元)', '舒适 (8000-20000元)', '奢华 (>20000元)'], required: true },
        { id: 's2_n4', type: 'multi-select', label: '旅行偏好', description: '选择感兴趣的活动（可多选）', options: ['美食探索', '自然风光', '历史文化', '购物血拼', '户外冒险', '海岛休闲'], required: true },
        { id: 's2_n5', type: 'select', label: '出行人数', description: '参与旅行的人数', options: ['独自旅行', '双人旅行', '3-5人小团', '家庭出游', '多人团队'], required: true }
      ]),
      8
    );

    insertSkill.run(
      '文章创作工作流',
      '通过结构化输入，生成高质量的文章写作提示词',
      '✍️',
      '写作',
      JSON.stringify([
        { id: 's3_n1', type: 'text', label: '文章主题', description: '输入文章的核心主题或标题关键词', placeholder: '例如：如何提高工作效率...', required: true },
        { id: 's3_n2', type: 'select', label: '文章风格', description: '选择写作风格', options: ['专业严谨', '轻松幽默', '故事叙述', '说明教程', '情感抒发'], required: true },
        { id: 's3_n3', type: 'select', label: '目标读者', description: '文章面向的读者群体', options: ['大众读者', '专业人士', '年轻人', '学生', '企业主管'], required: true },
        { id: 's3_n4', type: 'select', label: '文章长度', description: '期望的文章字数', options: ['简短 (~300字)', '中等 (~800字)', '详细 (~1500字)', '长篇 (~3000字)'], required: true },
        { id: 's3_n5', type: 'textarea', label: '关键要点', description: '列出需要包含的关键信息或要点', placeholder: '例如：1. 时间管理技巧 2. 减少干扰 3. 专注工具推荐...', required: false }
      ]),
      15
    );

    insertSkill.run(
      '商品拍摄工作流',
      '为电商产品图生成专业拍摄方案和AI提示词',
      '📦',
      '摄影',
      JSON.stringify([
        { id: 's4_n1', type: 'text', label: '产品名称', description: '输入要拍摄的产品名称', placeholder: '例如：无线蓝牙耳机、手提包...', required: true },
        { id: 's4_n2', type: 'select', label: '拍摄风格', description: '选择产品图的整体风格', options: ['简洁白底', '场景生活化', '创意艺术', '奢华大气', '清新自然'], required: true },
        { id: 's4_n3', type: 'select', label: '主色调', description: '选择图片的主要色调', options: ['白色/浅色系', '黑色/深色系', '暖色调', '冷色调', '彩色缤纷'], required: true },
        { id: 's4_n4', type: 'multi-select', label: '拍摄角度', description: '需要哪些拍摄角度（可多选）', options: ['正面', '侧面', '45度角', '俯拍', '细节特写'], required: true },
        { id: 's4_n5', type: 'textarea', label: '产品特点', description: '描述产品的核心卖点或特色', placeholder: '例如：轻薄设计、防水材质、限量配色...', required: false }
      ]),
      6
    );
  }

  db.save();
  setInterval(() => { db.save(); }, 30000);

  dbInstance = db;
  return db;
}

module.exports = { getDb };
