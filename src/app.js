require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Route imports
const certificateRoutes = require('./routes/certificates');
const templateRoutes = require('./routes/templates');
const uploadRoutes = require('./routes/uploads');
const batchRoutes = require('./routes/batch');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Ensure required directories exist
const requiredDirs = [
  process.env.UPLOAD_DIR || './backend/uploads',
  process.env.PHOTOS_DIR || './backend/photos',
  process.env.CERTIFICATES_DIR || './backend/certificates',
  process.env.TEMPLATES_DIR || './backend/templates'
];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Static file serving
app.use('/photos', express.static(process.env.PHOTOS_DIR || './backend/photos'));
app.use('/certificates', express.static(process.env.CERTIFICATES_DIR || './backend/certificates'));
app.use('/templates', express.static(process.env.TEMPLATES_DIR || './backend/templates'));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/certificates', certificateRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/batch', batchRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  Employee Award Certificate Generator Server              ║
║  Running on http://localhost:${PORT}                         ║
║  Environment: ${process.env.NODE_ENV || 'development'}                             ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
