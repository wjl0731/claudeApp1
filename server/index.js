const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Attach DB to every request
app.use(async (req, res, next) => {
  try {
    req.db = await getDb();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database initialization failed' });
  }
});

// API routes
app.use('/api/skills', require('./routes/skills'));
app.use('/api/ai', require('./routes/ai'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

getDb().then(() => {
  app.listen(PORT, () => {
    console.log(`AI Workflow Builder server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
