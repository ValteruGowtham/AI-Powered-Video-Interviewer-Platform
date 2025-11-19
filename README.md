# 🎤 AI-Powered Mock Interview Platform

> Master your interview skills with AI-driven feedback and realistic voice interactions

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-orange.svg)](https://openai.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

AI Mock Interviewer is a comprehensive platform that helps job seekers practice and improve their interview skills through AI-powered evaluation and realistic voice-based interactions. Get instant feedback, detailed performance reports, and actionable recommendations to ace your next interview.

### Key Highlights

- 🤖 **AI-Powered Evaluation** - Intelligent feedback using OpenAI GPT-3.5
- 🎙️ **Voice-Based Interviews** - Natural speech recognition and text-to-speech
- 📊 **Comprehensive Reports** - Detailed analytics with audio playback
- 📚 **Question Bank Management** - Curated questions across multiple categories
- 🎯 **Customizable Sessions** - Choose category, difficulty, and question count
- 💾 **Audio Storage** - Record and replay your interview responses
- 📈 **Performance Tracking** - Monitor progress across multiple sessions

## ✨ Features

### For Candidates

- **Hybrid Question Modes** - Choose your interview style:
  - 🤖 **AI-Generated Questions** - Fresh, role-specific questions tailored to your job target
  - ✍️ **Question Bank** - Curated, proven questions from the database
- **Interactive Avatar** - Engaging visual feedback with talking, listening, and thinking states
- **Real-time Transcription** - See your spoken answers transcribed instantly
- **Instant AI Evaluation** - Get scores and feedback immediately after each answer
- **Comprehensive Reports** - View detailed performance analysis with:
  - Overall score and category breakdown
  - Question-by-question review with audio playback
  - AI-generated strengths and improvement areas
  - Downloadable PDF reports
- **Flexible Configuration** - Customize your practice session:
  - Select question mode (AI-generated or Question Bank)
  - Choose job role/topic for AI generation
  - Select question category (HR, Technical, Behavioral, or Mixed)
  - Choose difficulty level (Easy, Medium, Hard, or Mixed)
  - Set number of questions (3-10)
- **Smart Fallback** - Automatically uses question bank if AI generation fails

### For Administrators

- **AI Question Generator** - Generate contextual questions using OpenAI:
  - Enter job role/topic for targeted questions
  - Preview generated questions before saving
  - Regenerate individual questions if needed
  - Save to question bank with AI metadata
- **Question Bank Management** - Add, edit, and delete interview questions
- **Source Filtering** - Filter questions by AI-generated or manually created
- **Session Monitoring** - View all candidate interview sessions
- **Performance Analytics** - Track usage and success metrics
- **Category Organization** - Organize questions by type and difficulty

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - UI library
- **React Router 6.14.1** - Client-side routing
- **Axios 1.4.0** - HTTP client
- **Vite 5.0.0** - Build tool and development server
- **Web Speech API** - Speech recognition and synthesis
- **MediaRecorder API** - Audio recording

### Backend
- **Node.js 16+** - Runtime environment
- **Express 4.18.2** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose 7.0** - MongoDB ODM
- **Multer 1.4.5** - File upload handling
- **OpenAI API** - AI evaluation service
- **CORS 2.8.5** - Cross-origin resource sharing

### APIs & Services
- **OpenAI GPT-3.5 Turbo** - Natural language processing
- **MongoDB Atlas** - Cloud database hosting
- **Web Speech API** - Browser-based speech features

## 📁 Project Structure

```
ai-mock-interviewer/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── multerConfig.js       # File upload configuration
│   ├── controllers/
│   │   ├── evaluationController.js   # AI evaluation logic
│   │   ├── questionController.js     # Question CRUD operations
│   │   ├── sessionController.js      # Session management
│   │   ├── summaryController.js      # Interview summary generation
│   │   └── userController.js         # User operations
│   ├── models/
│   │   ├── InterviewSession.js   # Session schema
│   │   ├── Question.js           # Question schema
│   │   └── User.js               # User schema
│   ├── routes/
│   │   ├── evaluationRoutes.js   # Evaluation endpoints
│   │   ├── questionRoutes.js     # Question endpoints
│   │   ├── sessionRoutes.js      # Session endpoints
│   │   ├── summaryRoutes.js      # Summary endpoints
│   │   └── userRoutes.js         # User endpoints
│   ├── uploads/                  # Audio file storage
│   ├── .env.example             # Environment variables template
│   ├── index.js                 # Server entry point
│   ├── package.json             # Dependencies
│   └── seed.js                  # Database seeding script
│
├── frontend/
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx        # Navigation header
│   │   │   ├── InterviewAvatar.jsx   # Animated avatar
│   │   │   └── InterviewAvatar.css   # Avatar styles
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing page
│   │   │   ├── Home.css          # Landing page styles
│   │   │   ├── Interview.jsx     # Interview interface
│   │   │   ├── Interview.css     # Interview styles
│   │   │   ├── Admin.jsx         # Admin panel
│   │   │   ├── Admin.css         # Admin styles
│   │   │   ├── Report.jsx        # Performance report
│   │   │   └── Report.css        # Report styles
│   │   ├── App.jsx               # Root component
│   │   └── main.jsx              # Entry point
│   ├── .env.example             # Environment variables template
│   ├── package.json             # Dependencies
│   └── vite.config.js           # Vite configuration
│
├── SETUP.md                      # Setup instructions
├── AUDIO_REPORT_GUIDE.md        # Audio & report documentation
├── README.md                     # This file
└── LICENSE                       # MIT License
```

## 🚀 Installation

### Prerequisites

- **Node.js** v16.0.0 or higher
- **npm** v8.0.0 or higher
- **MongoDB Atlas** account (free tier)
- **OpenAI API** account with API key

For detailed setup instructions, see [SETUP.md](SETUP.md).

### Quick Start

```bash
# 1. Install backend dependencies
cd backend && npm install

# 2. Install frontend dependencies
cd ../frontend && npm install

# 3. Configure environment variables
# Create backend/.env with MongoDB URI and OpenAI API key

# 4. Seed database
cd backend && npm run seed

# 5. Start backend
npm run dev

# 6. Start frontend (new terminal)
cd frontend && npm run dev

# 7. Open browser to http://localhost:5173
```

## 📖 Usage

### For Candidates

**Standard Interview (Question Bank Mode):**
1. Navigate to http://localhost:5173
2. Click "Start Practice Interview"
3. Enter your name
4. Select "✍️ Question Bank" mode
5. Configure interview settings (category, difficulty, count)
6. Click "Start Interview"
7. Grant microphone permission when prompted
8. Answer questions naturally by speaking
9. Review AI evaluation after each answer
10. View comprehensive report at the end

**AI-Powered Interview (AI Generation Mode):**
1. Navigate to http://localhost:5173
2. Click "Start Practice Interview"
3. Enter your name
4. Select "🤖 AI Generated" mode
5. Enter your target job role (e.g., "Senior React Developer")
6. Configure category and difficulty
7. Click "Start Interview"
8. AI generates fresh, role-specific questions
9. Answer and receive evaluations
10. Review your personalized report

**Note:** If AI generation fails, the system automatically falls back to question bank mode.

### For Administrators

**Manage Question Bank:**
1. Navigate to http://localhost:5173/admin
2. Click "Question Bank" tab
3. Add, edit, or delete questions
4. Filter by source (All/AI/Manual)
5. View question metadata and keywords

**Generate AI Questions:**
1. Navigate to http://localhost:5173/admin
2. Click "🤖 AI Generator" tab
3. Enter job role/topic (e.g., "Full Stack Developer")
4. Select category, difficulty, and count
5. Click "Generate Questions"
6. Preview generated questions
7. Save all or individually
8. Regenerate specific questions if needed
9. Discard unwanted questions

**Monitor Sessions:**
1. Click "Sessions" tab
2. View all interview sessions
3. Review candidate performance
4. Track completion rates

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Questions
- `GET /questions` - Get all questions
- `GET /questions/random` - Get random questions
- `POST /questions` - Create question
- `PUT /questions/:id` - Update question
- `DELETE /questions/:id` - Delete question

#### AI Question Generation
- `POST /ai-questions/generate` - Generate questions using AI
  - Body: `{ topic, category, difficulty, count }`
  - Returns: Array of generated questions
- `POST /ai-questions/save` - Save generated questions to database
  - Body: `{ questions: [...] }`
- `POST /ai-questions/regenerate` - Regenerate single question
  - Body: `{ topic, category, difficulty, originalQuestion }`

#### Sessions
- `GET /sessions` - Get all sessions
- `POST /sessions` - Create session
- `POST /sessions/:id/response` - Save response with audio
- `PUT /sessions/:id/feedback` - Update feedback

#### Evaluation
- `POST /evaluate` - Evaluate response
- `POST /summary/:id/generate-summary` - Generate AI summary

For detailed API documentation, see [API Documentation](#api-documentation) section.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** - For providing the GPT-3.5 API
- **MongoDB** - For cloud database hosting
- **React Team** - For the amazing UI library

---

**Built with ❤️ for interview success**

*Making interview preparation accessible and effective for everyone*
