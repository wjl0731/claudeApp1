const express = require('express');
const router = express.Router();

// GET all skills
router.get('/', (req, res) => {
  try {
    const skills = req.db.prepare('SELECT * FROM skills ORDER BY updated_at DESC').all();
    res.json(skills.map(s => ({ ...s, nodes: JSON.parse(s.nodes || '[]') })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single skill
router.get('/:id', (req, res) => {
  try {
    const skill = req.db.prepare('SELECT * FROM skills WHERE id = ?').get(req.params.id);
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    res.json({ ...skill, nodes: JSON.parse(skill.nodes || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create skill
router.post('/', (req, res) => {
  try {
    const { name, description, icon, category, nodes, prompt_template } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const result = req.db.prepare(
      'INSERT INTO skills (name, description, icon, category, nodes, prompt_template) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      name,
      description || '',
      icon || '🎯',
      category || '通用',
      JSON.stringify(nodes || []),
      prompt_template || ''
    );

    req.db.save();
    const skill = req.db.prepare('SELECT * FROM skills WHERE id = ?').get(result.lastInsertRowid);
    res.json({ ...skill, nodes: JSON.parse(skill.nodes || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update skill
router.put('/:id', (req, res) => {
  try {
    const { name, description, icon, category, nodes, prompt_template } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    req.db.prepare(
      'UPDATE skills SET name=?, description=?, icon=?, category=?, nodes=?, prompt_template=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
    ).run(
      name,
      description || '',
      icon || '🎯',
      category || '通用',
      JSON.stringify(nodes || []),
      prompt_template || '',
      req.params.id
    );

    req.db.save();
    const skill = req.db.prepare('SELECT * FROM skills WHERE id = ?').get(req.params.id);
    if (!skill) return res.status(404).json({ error: 'Skill not found' });
    res.json({ ...skill, nodes: JSON.parse(skill.nodes || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE skill
router.delete('/:id', (req, res) => {
  try {
    req.db.prepare('DELETE FROM skills WHERE id = ?').run(req.params.id);
    req.db.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST increment use count
router.post('/:id/use', (req, res) => {
  try {
    req.db.prepare('UPDATE skills SET use_count = use_count + 1 WHERE id = ?').run(req.params.id);
    req.db.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
