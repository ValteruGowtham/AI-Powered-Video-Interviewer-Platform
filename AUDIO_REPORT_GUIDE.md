# Audio Storage & Report System - Implementation Guide

## Overview
This document describes the audio storage and comprehensive reporting system implemented for the AI Mock Interviewer platform.

## Features Implemented

### 1. Audio Recording & Storage
- **Backend Storage**: Audio files are stored in `/backend/uploads/` directory
- **File Upload**: Multer middleware handles multipart/form-data uploads
- **File Naming**: Unique filenames with timestamp (e.g., `audio-1234567890-123456789.webm`)
- **File Types**: Supports audio/webm, audio/wav, audio/mp3, audio/mpeg, audio/ogg
- **File Size Limit**: 10MB per audio file
- **Static Serving**: Audio files accessible via `/uploads/filename` endpoint

### 2. Interview Recording Flow
1. User starts recording → MediaRecorder captures audio
2. User stops recording → Audio blob created
3. Audio converted to File object
4. Sent to backend via FormData with transcription
5. Backend saves file and stores path in database
6. Response can be played back in report

### 3. Comprehensive Report Page

#### Report Features:
- **Overall Score**: Circular progress chart showing average score
- **Category Breakdown**: Horizontal bars showing performance by category (HR, Technical, Behavioral)
- **AI Summary**: 
  - Overall strengths
  - Areas to improve
  - Final recommendation
- **Question-by-Question Review**:
  - Question text with category/difficulty badges
  - Audio playback button for each answer
  - Transcription display
  - Individual scores
  - Timestamp when answered
- **Actions**:
  - Download PDF (placeholder - uses browser print)
  - Start new interview
  - Return to home

#### Report Generation:
1. After last question, user automatically redirected to `/report/:sessionId`
2. Backend generates AI summary using OpenAI GPT-3.5
3. Calculates overall score (average of all question scores)
4. Generates category-wise performance analysis
5. Provides strengths, weaknesses, and recommendations

### 4. API Endpoints

#### Audio Upload
```
POST /api/sessions/:sessionId/response
Content-Type: multipart/form-data

Body:
- audio: File (audio recording)
- questionId: String
- transcription: String
- score: Number (optional)
```

#### Generate Summary
```
POST /api/summary/:sessionId/generate-summary

Response:
{
  "message": "Summary generated successfully",
  "summary": {
    "overallScore": 75,
    "overallStrengths": ["strength1", "strength2"],
    "areasToImprove": ["area1", "area2"],
    "finalRecommendation": "..."
  },
  "session": { ... }
}
```

## File Structure

### Backend
```
backend/
├── config/
│   └── multerConfig.js          # Multer configuration
├── controllers/
│   ├── sessionController.js     # Updated with audio handling
│   └── summaryController.js     # AI summary generation
├── routes/
│   ├── sessionRoutes.js         # Updated with multer middleware
│   └── summaryRoutes.js         # Summary routes
├── uploads/                     # Audio storage directory
│   ├── .gitignore              # Ignore audio files
│   └── .gitkeep                # Keep directory in git
└── index.js                     # Updated with static file serving
```

### Frontend
```
frontend/src/
├── pages/
│   ├── Interview.jsx            # Updated with audio recording
│   ├── Report.jsx               # New comprehensive report page
│   └── Report.css               # Report styling
└── App.jsx                      # Updated with report route
```

## Usage Instructions

### For Users:
1. **Start Interview**: Click "Start Interview" and enter your name
2. **Answer Questions**: Click "Start Recording" to answer each question
3. **Stop Recording**: Click "Stop Recording" when done
4. **View Evaluation**: See AI feedback immediately after each answer
5. **Complete Interview**: After answering all 5 questions, automatically redirected to report
6. **View Report**: See comprehensive analysis with audio playback
7. **Download Report**: Print page as PDF for offline access

### For Developers:

#### Testing Audio Storage:
```powershell
# Start backend server
cd backend
npm run dev

# Test file upload
$file = Get-Item "path\to\audio.webm"
$form = @{
  audio = $file
  questionId = "question_id_here"
  transcription = "Test transcription"
}
Invoke-RestMethod -Uri "http://localhost:5000/api/sessions/session_id/response" `
  -Method Post -Form $form
```

#### Testing Summary Generation:
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/summary/session_id/generate-summary" `
  -Method Post | ConvertTo-Json -Depth 5
```

## Environment Variables
Ensure these are set in `/backend/.env`:
```
OPENAI_API_KEY=your_api_key_here
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

## Browser Compatibility
- **Audio Recording**: Chrome, Edge (WebM format)
- **Speech Recognition**: Chrome, Edge (webkitSpeechRecognition)
- **Audio Playback**: All modern browsers

## Data Flow

### Recording & Storage:
```
User speaks → MediaRecorder captures → Blob created → 
Convert to File → FormData upload → Multer processes → 
File saved to /uploads → Path stored in DB → 
Response document updated
```

### Report Generation:
```
Interview completes → Navigate to /report/:sessionId → 
Fetch session data → Check if summary exists → 
If not: Call OpenAI API → Calculate scores → 
Generate category breakdown → Save to DB → 
Display comprehensive report with audio playback
```

## Fallback Mechanisms
- **AI Summary**: If OpenAI fails, generates rule-based summary
- **Audio Storage**: If upload fails, still saves transcription
- **Evaluation**: If AI evaluation fails, shows basic feedback

## Security Considerations
- File type validation (only audio files)
- File size limits (10MB max)
- Unique filenames prevent collisions
- Audio files served as static content (consider authentication in production)

## Performance Optimizations
- Audio files stored locally for fast access
- Summary generated once and cached
- Category scores calculated on-demand
- Lazy loading of audio elements

## Future Enhancements
- PDF generation with proper library (jsPDF, pdfkit)
- Audio file compression
- Cloud storage integration (AWS S3, Azure Blob)
- Audio waveform visualization
- Session sharing via unique links
- Email report delivery
- Multiple language support for TTS/STT

## Troubleshooting

### Audio not recording:
- Check microphone permissions
- Verify MediaRecorder support
- Check console for errors

### Upload failing:
- Verify backend server is running
- Check file size (<10MB)
- Verify file type is supported
- Check network requests in DevTools

### Report not loading:
- Verify session ID is valid
- Check backend logs for errors
- Verify OpenAI API key is set
- Check network connectivity

## Testing Checklist
- [ ] Audio recording works in browser
- [ ] Audio file uploads successfully
- [ ] File appears in /uploads directory
- [ ] Audio path stored in database
- [ ] Audio playback works in report
- [ ] Summary generates correctly
- [ ] Overall score calculates properly
- [ ] Category breakdown displays
- [ ] Navigation works (interview → report)
- [ ] Print/PDF export works

## API Response Examples

### Session with Audio Response:
```json
{
  "session": {
    "_id": "session_id",
    "candidateName": "John Doe",
    "responses": [
      {
        "questionId": "question_id",
        "audioURL": "/uploads/audio-1234567890-123456789.webm",
        "transcription": "My answer to the question...",
        "score": 85,
        "answeredAt": "2025-11-19T10:30:00.000Z"
      }
    ]
  }
}
```

### Summary Response:
```json
{
  "summary": {
    "overallScore": 78,
    "overallStrengths": [
      "Strong technical knowledge",
      "Clear communication",
      "Good problem-solving approach"
    ],
    "areasToImprove": [
      "Provide more specific examples",
      "Elaborate on past experiences"
    ],
    "finalRecommendation": "Overall strong performance with room for improvement..."
  }
}
```
