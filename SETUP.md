# AI Mock Interviewer - Setup Guide

Complete setup instructions for the AI-Powered Mock Interview Platform.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [MongoDB Setup](#mongodb-setup)
- [OpenAI API Configuration](#openai-api-configuration)
- [Running the Application](#running-the-application)
- [Testing Guide](#testing-guide)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js** (v16.0.0 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
  
- **npm** (v8.0.0 or higher)
  - Comes with Node.js
  - Verify installation: `npm --version`

- **MongoDB Account**
  - Create a free account at: https://www.mongodb.com/cloud/atlas
  - Or install MongoDB locally: https://www.mongodb.com/try/download/community

- **OpenAI API Account**
  - Create an account at: https://platform.openai.com/
  - Obtain API key from: https://platform.openai.com/api-keys

### System Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: ~500MB for dependencies
- **Internet Connection**: Required for API calls and MongoDB Atlas

## Installation

### Step 1: Clone or Download the Project

```bash
cd "C:\Users\YourUsername\Desktop"
# Navigate to your desired location
```

### Step 2: Install Backend Dependencies

```powershell
# Navigate to backend directory
cd ai-mock-interviewer\backend

# Install all dependencies
npm install
```

**Expected packages installed:**
- express (^4.18.2) - Web framework
- mongoose (^7.0.0) - MongoDB ODM
- cors (^2.8.5) - Cross-origin resource sharing
- dotenv (^16.0.0) - Environment variables
- multer (^1.4.5-lts.1) - File uploads
- openai (latest) - OpenAI API client
- nodemon (^2.0.20) - Development auto-reload

### Step 3: Install Frontend Dependencies

```powershell
# Navigate to frontend directory
cd ..\frontend

# Install all dependencies
npm install
```

**Expected packages installed:**
- react (^18.2.0) - UI library
- react-dom (^18.2.0) - React DOM renderer
- react-router-dom (^6.14.1) - Routing
- axios (^1.4.0) - HTTP client
- vite (^5.0.0) - Build tool
- @vitejs/plugin-react (^4.0.0) - Vite React plugin

## MongoDB Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create a MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free tier

2. **Create a New Cluster**
   - Click "Build a Database"
   - Select "Free" tier (M0 Sandbox)
   - Choose a cloud provider and region (closest to you)
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Authentication Method: Password
   - Username: `ai_interview_user` (or your choice)
   - Password: Generate a secure password
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP address (more secure)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Driver: Node.js, Version: 5.5 or later
   - Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

6. **Modify Connection String**
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Add database name after `.net/`: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/ai-mock-interviewer?retryWrites=true&w=majority`

### Option 2: Local MongoDB Installation

1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Download for your operating system
   - Install with default settings

2. **Start MongoDB Service**
   ```powershell
   # Windows (as Administrator)
   net start MongoDB

   # macOS/Linux
   sudo systemctl start mongod
   ```

3. **Connection String**
   - Local connection: `mongodb://localhost:27017/ai-mock-interviewer`

## OpenAI API Configuration

1. **Create OpenAI Account**
   - Go to: https://platform.openai.com/signup
   - Sign up or log in

2. **Generate API Key**
   - Navigate to: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Give it a name (e.g., "AI Mock Interviewer")
   - Copy the API key immediately (it won't be shown again)
   - Example key format: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **Add Billing Information (if required)**
   - Go to: https://platform.openai.com/account/billing
   - Add payment method
   - Set usage limits to avoid unexpected charges

## Environment Configuration

### Configure Backend Environment

1. **Create .env file in backend folder**

```powershell
# Navigate to backend directory
cd ai-mock-interviewer\backend

# Create .env file (Windows PowerShell)
New-Item -ItemType File -Name ".env"
```

2. **Edit .env file with your credentials**

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/ai-mock-interviewer?retryWrites=true&w=majority

# OpenAI API
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Server Port
PORT=5000

# Environment
NODE_ENV=development
```

**Important Notes:**
- Replace `your_username` and `your_password` with your MongoDB credentials
- Replace the OpenAI API key with your actual key
- Never commit .env file to version control
- Keep your API keys secret

### Verify .env Configuration

```powershell
# Check if .env file exists
Test-Path .env

# View .env contents (careful, contains secrets!)
Get-Content .env
```

## Database Seeding

### Seed the Question Bank

```powershell
# In backend directory
cd ai-mock-interviewer\backend

# Run seed script
npm run seed
```

**Expected Output:**
```
MongoDB connected successfully
Cleared existing questions
✓ Seeded 10 questions:
  - 3 HR questions
  - 4 Technical questions
  - 3 Behavioral questions
Done!
```

**Seed Script Details:**
- Creates 10 pre-configured interview questions
- Covers HR, Technical, and Behavioral categories
- Includes Easy, Medium, and Hard difficulty levels
- Each question has relevant keywords for evaluation

## Running the Application

### Start Backend Server

```powershell
# Method 1: Development mode with auto-reload
cd ai-mock-interviewer\backend
npm run dev

# Method 2: Production mode
npm start
```

**Expected Output:**
```
Server running on port 5000
MongoDB connected successfully
```

**Backend Endpoints Available:**
- `http://localhost:5000/` - API root
- `http://localhost:5000/api/questions` - Questions API
- `http://localhost:5000/api/sessions` - Sessions API
- `http://localhost:5000/api/evaluate` - Evaluation API
- `http://localhost:5000/api/summary` - Summary API

### Start Frontend Development Server

```powershell
# Open new terminal/PowerShell window
cd ai-mock-interviewer\frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Access the Application

1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:5000

### Verify Both Servers are Running

```powershell
# Test backend health
Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get

# Test frontend
Start-Process "http://localhost:5173"
```

## Testing Guide

### 1. Test Backend API

```powershell
# Test MongoDB connection & question retrieval
Invoke-RestMethod -Uri "http://localhost:5000/api/questions" -Method Get | ConvertTo-Json

# Create test session
$body = @{
    candidateName = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/sessions" `
  -Method Post `
  -Body $body `
  -ContentType "application/json" | ConvertTo-Json
```

### 2. Test Frontend Features

**Landing Page:**
- Navigate to http://localhost:5173
- Verify hero section loads
- Check "Start Practice Interview" button works
- Check "Admin Panel" button works

**Interview Flow:**
1. Click "Start Practice Interview"
2. Fill in settings form:
   - Name: Your Name
   - Category: Mixed
   - Difficulty: Mixed
   - Questions: 5
3. Click "Start Interview"
4. Grant microphone permission when prompted
5. Wait for avatar to ask first question
6. Click "Start Recording"
7. Speak your answer
8. Click "Stop Recording"
9. Wait for AI evaluation
10. Click "Next Question"
11. Repeat for all questions
12. Review final report

**Admin Panel:**
1. Navigate to http://localhost:5173/admin
2. Test "Question Bank" tab
3. Test "Sessions" tab
4. Try adding/editing/deleting questions

### 3. Test Audio Storage

```powershell
# Check if uploads directory exists
Test-Path "ai-mock-interviewer\backend\uploads"

# List uploaded audio files (after recording answers)
Get-ChildItem "ai-mock-interviewer\backend\uploads"
```

### 4. Test AI Evaluation

**Requirements:**
- Valid OpenAI API key
- Internet connection
- At least $0.01 in OpenAI account balance

**Test Evaluation:**
1. Complete an interview question
2. Check evaluation response includes:
   - Score (0-100)
   - Strengths array
   - Weaknesses array
   - Feedback text
3. Verify evaluation type is "AI" (not "Fallback")

## AI Question Generation

### Overview

The platform supports **two modes** for interview questions:

1. **Question Bank Mode** - Use curated questions from the database
2. **AI Generation Mode** - Generate fresh, role-specific questions using OpenAI

### Admin Panel - AI Generator

**Access the AI Generator:**
1. Navigate to http://localhost:5173/admin
2. Click the "🤖 AI Generator" tab

**Generate Questions:**
1. Enter job role/topic (e.g., "Frontend Developer", "Data Scientist")
2. Select category (HR/Technical/Behavioral)
3. Select difficulty (Easy/Medium/Hard)
4. Choose number of questions (1-10)
5. Click "Generate Questions"

**Review Generated Questions:**
- Preview all generated questions with keywords
- **Save** individual questions to question bank
- **Regenerate** specific questions if needed
- **Discard** unwanted questions
- **Save All** to add all questions at once

**Question Bank Management:**
- Filter questions by source: All / AI / Manual
- Questions show badges: 🤖 AI or ✍️ Manual
- AI questions include "Generated for: [Role]" metadata

### Interview - Question Mode Selection

**Choose Your Mode:**

**Option 1: Question Bank Mode (Default)**
- Uses curated questions from database
- Select category and difficulty
- Proven, tested questions
- Immediate start

**Option 2: AI Generation Mode**
1. Select "🤖 AI Generated" mode
2. Enter your target job role/topic
3. Select category and difficulty
4. Click "Start Interview"
5. AI generates fresh questions specific to your role
6. **Fallback:** If AI fails, automatically uses question bank

**Benefits of Each Mode:**

| Feature | Question Bank | AI Generated |
|---------|--------------|--------------|
| Speed | Instant | 3-5 seconds |
| Customization | Category/Difficulty | Role-specific |
| Reliability | 100% | 95%+ (with fallback) |
| Variety | Pre-defined set | Unique every time |
| Best For | Practice common questions | Role-specific prep |

### Testing AI Generation

**Test Admin Panel Generation:**
```powershell
# Start both servers
# Backend in terminal 1
cd ai-mock-interviewer\backend
npm run dev

# Frontend in terminal 2
cd ai-mock-interviewer\frontend
npm run dev
```

**Test Steps:**
1. Open http://localhost:5173/admin
2. Click "🤖 AI Generator"
3. Enter topic: "React Developer"
4. Select category: "Technical"
5. Select difficulty: "Medium"
6. Set count: 5
7. Click "Generate Questions"
8. Wait 3-5 seconds
9. Review generated questions
10. Click "Save All" or save individually

**Test Interview AI Mode:**
1. Go to http://localhost:5173/interview
2. Enter your name
3. Select "🤖 AI Generated" mode
4. Enter job role: "Full Stack Developer"
5. Choose category and difficulty
6. Click "Start Interview"
7. Verify questions are role-specific
8. During interview, check mode indicator: "🤖 AI Generated"

**Test Fallback Mechanism:**
1. Temporarily set invalid OpenAI API key
2. Start interview in AI mode
3. Verify fallback to question bank occurs
4. Check toast notification shows fallback message

## Troubleshooting

### Backend Issues

**Error: "MongoDB connection failed"**
```
Solution:
1. Check MONGODB_URI in .env file
2. Verify MongoDB Atlas IP whitelist includes your IP
3. Confirm database user credentials are correct
4. Test connection string in MongoDB Compass
```

**Error: "Cannot find module 'multer'"**
```powershell
Solution:
cd backend
npm install multer
```

**Error: "OpenAI API key invalid"**
```
Solution:
1. Check OPENAI_API_KEY in .env file
2. Ensure key starts with "sk-"
3. Verify key is active in OpenAI dashboard
4. Check for extra spaces or quotes in .env
```

**Error: "Port 5000 already in use"**
```powershell
Solution:
# Find process using port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Kill the process
Stop-Process -Id <process_id> -Force

# Or change PORT in .env file
```

### Frontend Issues

**Error: "Failed to fetch"**
```
Solution:
1. Verify backend is running on port 5000
2. Check CORS is enabled in backend
3. Confirm API_BASE_URL in Interview.jsx is correct
```

**Error: "Microphone permission denied"**
```
Solution:
1. Check browser microphone permissions
2. Use HTTPS in production (required for some browsers)
3. Try Chrome/Edge (best browser support)
4. Check system microphone permissions
```

**Error: "Speech recognition not supported"**
```
Solution:
1. Use Chrome or Edge browser
2. Update browser to latest version
3. Note: webkitSpeechRecognition only works in Chromium browsers
```

### Audio Recording Issues

**No audio playback in report:**
```
Solution:
1. Check uploads directory exists
2. Verify multer configuration is correct
3. Check file was uploaded (check uploads folder)
4. Ensure static file serving is configured
```

**Audio files too large:**
```
Solution:
1. Reduce recording quality (in MediaRecorder options)
2. Implement audio compression
3. Increase multer file size limit
```

### AI Question Generation Issues

**Error: "Failed to generate questions"**
```
Solution:
1. Verify OpenAI API key is valid and active
2. Check OpenAI account has sufficient credits
3. Ensure internet connection is stable
4. Check rate limiting hasn't been exceeded (30 req/15min)
5. Review backend console for detailed error messages
```

**Generated questions are low quality:**
```
Solution:
1. Be more specific with job role/topic
   - Bad: "Developer"
   - Good: "Senior Frontend Developer with React"
2. Select appropriate difficulty level
3. Try regenerating individual questions
4. Provide feedback in topic field (e.g., "Junior Python Developer - Focus on basics")
```

**AI generation times out:**
```
Solution:
1. Reduce number of questions to generate (try 3-5 instead of 10)
2. Check OpenAI API status: https://status.openai.com
3. Fallback to question bank mode will trigger automatically
```

**Questions not appearing in question bank:**
```
Solution:
1. Ensure you clicked "Save" or "Save All"
2. Check browser console for errors
3. Verify MongoDB connection is active
4. Refresh admin panel after saving
```

**Fallback to question bank not working:**
```
Solution:
1. Ensure database has questions seeded (run npm run seed)
2. Check backend logs for database connection errors
3. Verify question bank has questions matching selected filters
```

### Performance Issues

**Slow API responses:**
```
Solution:
1. Check internet connection speed
2. Use MongoDB Atlas cluster in same region
3. Optimize OpenAI API calls
4. Enable response caching
```

**High memory usage:**
```
Solution:
1. Clear audio files from uploads directory
2. Restart backend server
3. Check for memory leaks in long-running processes
```

## Browser Compatibility

### Recommended Browsers
- ✅ Google Chrome (latest)
- ✅ Microsoft Edge (latest)
- ⚠️ Firefox (speech recognition not supported)
- ⚠️ Safari (limited speech recognition support)

### Required Browser Features
- MediaRecorder API (audio recording)
- Web Speech API (speech recognition, text-to-speech)
- Fetch API (HTTP requests)
- LocalStorage (session data)

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=<production_mongodb_uri>
OPENAI_API_KEY=<your_api_key>
PORT=5000
FRONTEND_URL=https://your-domain.com
```

### Build Frontend for Production

```powershell
cd frontend
npm run build
```

### Security Checklist
- [ ] Never commit .env files
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS for production
- [ ] Restrict MongoDB IP whitelist
- [ ] Set OpenAI API usage limits
- [ ] Implement rate limiting on backend
- [ ] Add authentication for admin routes
- [ ] Sanitize user inputs
- [ ] Enable CORS only for specific origins

## Additional Resources

- **MongoDB Atlas Documentation**: https://docs.atlas.mongodb.com/
- **OpenAI API Documentation**: https://platform.openai.com/docs
- **React Documentation**: https://react.dev/
- **Express.js Documentation**: https://expressjs.com/
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

## Support

For issues and questions:
1. Check this SETUP.md file
2. Review AUDIO_REPORT_GUIDE.md for features
3. Check console logs for error messages
4. Verify all prerequisites are met
5. Test with provided PowerShell commands

## Quick Start Summary

```powershell
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Configure environment
# Create backend/.env with MongoDB URI and OpenAI API key

# 3. Seed database
cd backend && npm run seed

# 4. Start backend
npm run dev

# 5. Start frontend (new terminal)
cd frontend && npm run dev

# 6. Open browser
# Navigate to http://localhost:5173
```

Happy Interviewing! 🎤
