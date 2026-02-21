const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./database/db');
const apiRoutes = require('./api');

const app = express();
const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0'; // Important pour Render

// Connexion à MongoDB
connectDB();

// Créer le dossier raw s'il n'existe pas
const rawDir = path.join(__dirname, 'public', 'raw');
if (!fs.existsSync(rawDir)) {
  fs.mkdirSync(rawDir, { recursive: true });
}

// Middleware de sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

// Compression
app.use(compression());

// CORS - Configuration pour Render
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT) || 100,
  message: { 
    success: false, 
    error: 'Too many requests from this IP' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing avec limite augmentée
app.use(express.json({ limit: process.env.UPLOAD_SIZE_LIMIT || '50mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.UPLOAD_SIZE_LIMIT || '50mb' }));

// Routes API
app.use('/api', apiRoutes);

// Route pour les fichiers bruts
app.use('/raw', express.static(path.join(__dirname, 'public', 'raw'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Route de base avec infos Render
app.get('/', (req, res) => {
  res.json({
    name: 'BotMart API',
    version: '1.0.0',
    status: 'online',
    platform: 'Render.com',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    endpoints: {
      items: '/api/items',
      item: '/api/item/:id',
      trending: '/api/trending',
      stats: '/api/stats',
      paste: '/v1/paste',
      raw: '/raw/:filename'
    },
    documentation: 'https://github.com/votre-username/botmart#readme'
  });
});

// Route pour vérifier la santé du serveur (utile pour Render)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;

  res.status(statusCode).json({ 
    success: false, 
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Démarrage du serveur
app.listen(PORT, HOST, () => {
  console.log(`
╭──────────────────────────────────╮
│        🚀 BotMart Server          │
│   ════════════════════════════   │
│   Status: ✅ Online               │
│   Port: ${PORT.toString().padEnd(20)}│
│   Host: ${HOST.padEnd(20)}│
│   Environment: ${(process.env.NODE_ENV || 'development').padEnd(11)}│
│   MongoDB: ✅ Connected           │
│   Platform: Render.com             │
│   ${new Date().toLocaleString().padEnd(26)}│
╰──────────────────────────────────╯
  `);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
