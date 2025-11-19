const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup to allow frontend on multiple ports
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply general rate limiter to all API routes
app.use('/api/', apiLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Init DB (placeholder)
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
