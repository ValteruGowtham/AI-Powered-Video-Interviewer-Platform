const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorMiddleware, notFoundHandler } = require('./utils/errorHandler');
const logger = require('./utils/logger');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// CORS setup - configurable via environment
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({ 
  origin: corsOrigins,
  credentials: true
}));

// Request logging
app.use(logger.requestLogger);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply general rate limiter to all API routes
app.use('/api/', apiLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Init DB
connectDB();

// Routes
const userRoutes = require('./routes/userRoutes');
const questionRoutes = require('./routes/questionRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const summaryRoutes = require('./routes/summaryRoutes');
const aiQuestionRoutes = require('./routes/aiQuestionRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const followupRoutes = require('./routes/followupRoutes');
const careerAdvisorRoutes = require('./routes/careerAdvisorRoutes');

app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/evaluate', evaluationRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/ai-questions', aiQuestionRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/followup', followupRoutes);
app.use('/api/career-advisor', careerAdvisorRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Mock Interviewer API running',
    version: '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      users: '/api/users',
      questions: '/api/questions',
      sessions: '/api/sessions',
      evaluate: '/api/evaluate',
      aiQuestions: '/api/ai-questions',
      resume: '/api/resume',
      followup: '/api/followup',
      careerAdvisor: '/api/career-advisor'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Handle 404 for undefined routes
app.use(notFoundHandler);

// Global error handling middleware
app.use(errorMiddleware);

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development'
  });
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason: reason?.message || reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message });
  process.exit(1);
});
