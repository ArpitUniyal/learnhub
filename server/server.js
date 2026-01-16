require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const winston = require('winston');
const http = require('http');

// App + Server
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Models (includes sequelize + syncDB)
const db = require('./models');

// Routes
const authRoutes = require('./routes/auth');
const pdfRoutes = require('./routes/pdf');
const flashcardRoutes = require('./routes/flashcards');
const formulaRoutes = require("./routes/formulas");




// Welcome
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Learning Platform API running',
    timestamp: new Date().toISOString()
  });
});

// Health
app.get('/api/health', async (req, res) => {
  try {
    await db.sequelize.authenticate();
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/pdf', flashcardRoutes);
app.use("/api/pdf", formulaRoutes);




// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal Server Error'
  });
});

// Start server
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync();


    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);

      // WebSocket AFTER DB is ready
      const QuizWebSocket = require('./services/quizWebSocket');
      const quizWebSocket = new QuizWebSocket(server);
      app.set('quizWebSocket', quizWebSocket);

      logger.info('WebSocket server initialized');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Graceful shutdown
process.on('unhandledRejection', (err) => {
  logger.error(err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(err);
  server.close(() => process.exit(1));
});

module.exports = app;
