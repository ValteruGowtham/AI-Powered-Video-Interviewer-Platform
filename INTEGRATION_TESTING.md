# Integration Testing Guide

## ✅ Backend & Frontend Integration Complete!

### What's Been Integrated:

1. **Session Management**
   - Frontend creates a new interview session when "Start Interview" is clicked
   - Sessions are stored in MongoDB with candidate name
   - Each session gets 5 random questions from the database

2. **Question Fetching**
   - Questions are no longer hardcoded in the frontend
   - Fetched dynamically from backend API
   - Displays question category and difficulty level

3. **Response Saving**
   - Every answer is saved to MongoDB via API
   - Transcription is stored with the session
   - Linked to specific questions

4. **AI Evaluation**
   - Uses OpenAI GPT-3.5 for intelligent evaluation
   - Falls back to keyword matching if OpenAI fails
   - Provides:
     * Score (0-100)
     * Strengths (specific positive points)
     * Weaknesses (areas to improve)
     * Missing keywords
     * Overall feedback summary

---

## 🚀 How to Test:

### 1. Start Backend
```powershell
cd backend
npm run dev
```
**Expected:** Server running on port 5000, MongoDB connected

### 2. Start Frontend  
```powershell
cd frontend
npm run dev
```
**Expected:** Vite dev server on port 5173

### 3. Open Application
Navigate to: `http://localhost:5173/interview`

### 4. Test Flow:

**Step 1: Start Interview**
- Click "Start Interview"
- Enter your name when prompted
- Allow microphone permissions
- Avatar will greet you

**Step 2: Answer Question**
- Listen to the avatar speak the question
- Click "Start Recording"
- Speak your answer clearly
- Click "Stop Recording"

**Step 3: Get AI Feedback**
- Wait for "Evaluating your response..." spinner
- View your score (0-100)
- Read strengths and weaknesses
- See specific feedback

**Step 4: Next Question**
- Click "Next Question"
- Repeat for all 5 questions

**Step 5: Complete Interview**
- View completion message
- Option to start a new interview

---

## 🔑 OpenAI API Key Setup

The system works with **keyword-based evaluation** by default. To enable AI evaluation:

### Get API Key:
1. Go to: https://platform.openai.com/api-keys
2. Create an account (if needed)
3. Generate a new API key
4. Copy the key (starts with `sk-`)

### Configure:
Edit `backend/.env`:
```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Restart Backend:
The server will automatically use AI evaluation when a valid key is detected.

---

## 📊 API Endpoints in Use:

### Frontend → Backend Communication:

1. **POST /api/sessions**
   ```json
   { "candidateName": "John Doe" }
   ```
   Response: Session object with 5 random questions

2. **POST /api/sessions/:id/response**
   ```json
   {
     "questionId": "...",
     "transcription": "My answer...",
     "score": 85
   }
   ```
   Response: Updated session

3. **POST /api/evaluate**
   ```json
   {
     "questionId": "...",
     "transcription": "My answer..."
   }
   ```
   Response: Evaluation with score, strengths, weaknesses, feedback

---

## 🧪 Test Scenarios:

### Scenario 1: Normal Flow
✅ Start interview → Answer all 5 questions → Get evaluations → Complete

### Scenario 2: Backend Down
- Start interview fails gracefully
- Shows error message
- Allows retry

### Scenario 3: OpenAI API Fails
- Falls back to keyword matching
- Shows "Keyword" evaluation type
- Still provides score and feedback

### Scenario 4: Microphone Permission Denied
- Shows permission error
- Cannot start interview
- Clear error message

---

## 🎯 Expected Behavior:

### With OpenAI API Key:
- **Evaluation Type:** AI
- **Score:** Intelligent 0-100 based on answer quality
- **Strengths:** 2-3 specific positive points
- **Weaknesses:** 1-2 constructive improvement areas
- **Feedback:** Personalized 2-3 sentence summary

### Without OpenAI API Key (Keyword Fallback):
- **Evaluation Type:** Keyword
- **Score:** Based on keyword matches (e.g., 3/7 keywords = 43/100)
- **Strengths:** Lists matched keywords
- **Weaknesses:** Lists missing keywords
- **Feedback:** Simple summary of keyword coverage

---

## 🐛 Troubleshooting:

### "Failed to start interview"
- **Cause:** Backend not running
- **Fix:** Start backend server on port 5000

### "Failed to evaluate response"
- **Cause:** Evaluation API error
- **Fix:** Check OpenAI API key or use keyword fallback

### "Microphone permission denied"
- **Cause:** Browser blocked microphone
- **Fix:** Allow microphone in browser settings

### No questions displayed
- **Cause:** MongoDB not seeded
- **Fix:** Run `npm run seed` in backend

---

## 💾 Data Persistence:

All interviews are saved in MongoDB:

### View Sessions:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/sessions"
```

### View Specific Session:
```powershell
$sessionId = "..."
Invoke-RestMethod -Uri "http://localhost:5000/api/sessions/$sessionId"
```

You can see:
- Candidate name
- Questions asked
- Responses with transcriptions
- Scores for each answer
- Timestamps

---

## 🎨 UI Features:

1. **Real-time Transcription** - See your words as you speak
2. **Audio Waveform** - Visual feedback while recording
3. **Score Badge** - Prominent display of evaluation score
4. **Color-coded Feedback** - Blue for strengths, red for weaknesses
5. **Loading States** - Spinners during evaluation
6. **Error Handling** - Clear error messages
7. **Progress Indicator** - "Question 2/5 • Technical • Medium"

---

## 🔄 Next Steps:

Once testing is successful, you can:

1. Add more questions to the database
2. Customize evaluation criteria
3. Add video recording
4. Create candidate dashboard
5. Export interview reports
6. Add email notifications
7. Implement user authentication

---

## 📱 Browser Compatibility:

- ✅ **Chrome** - Full support (recommended)
- ✅ **Edge** - Full support
- ⚠️ **Safari** - Partial (speech recognition limited)
- ❌ **Firefox** - Limited (no speech recognition)

---

## 🎓 Tips for Best Results:

1. Use Chrome for best experience
2. Speak clearly and at moderate pace
3. Answer in complete sentences
4. Include relevant technical terms
5. Give specific examples
6. Take time to think before answering
7. Use good quality microphone

Enjoy your AI-powered mock interview practice! 🚀
