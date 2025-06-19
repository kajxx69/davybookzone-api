import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Import des routes
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import messageRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';
import purchaseRoutes from './routes/purchases.js';

// Configuration
dotenv.config();

// Connexion à la base de données
connectDB();

const app = express();

// Middleware de sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
  }
});

app.use('/api/', limiter);

// Rate limiting spécial pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limite à 5 tentatives de connexion par IP
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.'
  }
});

// Rate limiting pour l'inscription
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limite à 20 tentatives d'inscription par IP
  message: {
    success: false,
    message: 'Trop de tentatives d\'inscription, veuillez réessayer plus tard.'
  }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);

// CORS
const corsOptions = {
  origin: ['https://davybookzone.onrender.com'], // Autoriser le frontend Vite
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 heures
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/purchases', purchaseRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API DavyBookZone opérationnelle',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Route par défaut
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenue sur l\'API DavyBookZone',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// Middleware de gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Middleware de gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur:', err);

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors
    });
  }

  // Erreur de duplication MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} déjà existant`
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }

  // Erreur par défaut
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Erreur serveur interne'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV}`);
  console.log(`📡 API disponible sur: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err, promise) => {
  console.error('Erreur non gérée:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Exception non capturée:', err.message);
  process.exit(1);
});

export default app;