require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
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

// Models (includes sequelize + syncDB)
const db = require('./models');

// Routes
const authRoutes = require('./routes/auth');
const pdfRoutes = require('./routes/pdf');
const flashcardRoutes = require('./routes/flashcards');
const formulaRoutes = require("./routes/formulas");
const paymentRoutes = require("./routes/payment");




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
app.use("/api/payment", paymentRoutes);




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
