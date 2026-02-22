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
const HOST = '0.0.0.0';

console.log('📁 Vérification de la structure...');
console.log('Dossier courant:', __dirname);

// Vérifier que models/Item.js existe
const itemModelPath = path.join(__dirname, 'models', 'Item.js');
if (fs.existsSync(itemModelPath)) {
  console.log('✅ models/Item.js trouvé');
} else {
  console.error('❌ models/Item.js NON trouvé!');
}

// Connexion à MongoDB
connectDB();

// Créer le dossier raw
const rawDir = path.join(__dirname, 'public', 'raw');
if (!fs.existsSync(rawDir)) {
  fs.mkdirSync(rawDir, { recursive: true });
  console.log('✅ Dossier public/raw créé');
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

app.use(compression());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.API_RATE_LIMIT) || 100,
  message: { success: false, error: 'Too many requests' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api', apiRoutes);
app.use('/raw', express.static(path.join(__dirname, 'public', 'raw')));

// Route principale
app.get('/', (req, res) => {
  res.json({
    name: 'BotMart API',
    status: 'online',
    endpoints: {
      items: '/api/items',
      item: '/api/item/:id',
      trending: '/api/trending',
      stats: '/api/stats',
      paste: '/v1/paste',
      raw: '/raw/:filename'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

// Gestion 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Gestion erreurs
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Démarrage
app.listen(PORT, HOST, () => {
  console.log(`
╭──────────────────────────╮
│    🚀 BotMart Server      │
│    Port: ${PORT}              │
│    Status: ✅ Online       │
╰──────────────────────────╯
  `);
});
