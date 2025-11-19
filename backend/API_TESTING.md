# API Testing Guide

## Base URL
```
http://localhost:5000/api
```

## Question Endpoints

### 1. Get All Questions
```http
GET /api/questions
```

**Response:**
```json
{
  "count": 10,
  "questions": [...]
}
```

### 2. Get Random Questions
```http
GET /api/questions/random?count=5&category=Technical&difficulty=Medium
```

**Query Parameters:**
- `count` (optional): Number of questions (default: 5)
- `category` (optional): HR, Technical, or Behavioral
- `difficulty` (optional): Easy, Medium, or Hard

### 3. Get Questions by Category
```http
GET /api/questions/category/Technical
```

**Valid Categories:** HR, Technical, Behavioral

### 4. Get Questions by Difficulty
```http
GET /api/questions/difficulty/Medium
```

**Valid Difficulties:** Easy, Medium, Hard

### 5. Add New Question
```http
POST /api/questions
Content-Type: application/json

{
  "question": "What is your greatest weakness?",
  "category": "HR",
  "difficulty": "Medium",
  "keywords": ["self-awareness", "improvement", "growth", "honesty"]
}
```

### 6. Update Question
```http
PUT /api/questions/:id
Content-Type: application/json

{
  "difficulty": "Hard",
  "keywords": ["added", "keyword"]
}
```

### 7. Delete Question
```http
DELETE /api/questions/:id
```

---

## Session Endpoints

### 1. Create Interview Session
```http
POST /api/sessions
Content-Type: application/json

{
  "candidateName": "John Doe",
  "questionIds": ["questionId1", "questionId2"]
}
```

**Note:** If `questionIds` is empty or omitted, 5 random questions will be assigned.

**Response:**
```json
{
  "message": "Interview session created successfully",
  "session": {
    "_id": "sessionId",
    "candidateName": "John Doe",
    "questions": [...],
    "responses": [],
    "createdAt": "2025-11-19T..."
  }
}
```

### 2. Save Response to Question
```http
POST /api/sessions/:sessionId/response
Content-Type: application/json

{
  "questionId": "questionId",
  "transcription": "This is my answer to the question...",
  "audioURL": "https://example.com/audio.mp3",
  "score": 85
}
```

**Required Fields:** `questionId`, `transcription`

### 3. Get Session by ID
```http
GET /api/sessions/:sessionId
```

**Response:**
```json
{
  "session": {
    "_id": "sessionId",
    "candidateName": "John Doe",
    "questions": [...],
    "responses": [
      {
        "questionId": {...},
        "transcription": "...",
        "score": 85,
        "answeredAt": "..."
      }
    ],
    "overallScore": null,
    "feedback": {...}
  }
}
```

### 4. Get All Sessions
```http
GET /api/sessions
```

### 5. Update Session Feedback
```http
PUT /api/sessions/:sessionId/feedback
Content-Type: application/json

{
  "overallScore": 78,
  "feedback": {
    "strengths": [
      "Good communication skills",
      "Clear technical knowledge"
    ],
    "weaknesses": [
      "Could provide more specific examples",
      "Time management in responses"
    ],
    "summary": "Overall good performance with room for improvement in providing concrete examples."
  }
}
```

### 6. Delete Session
```http
DELETE /api/sessions/:sessionId
```

---

## Testing with PowerShell

### Install MongoDB locally (if needed)
```powershell
# Download and install MongoDB Community Edition
# Or use MongoDB Atlas (cloud)
```

### Seed the Database
```powershell
cd backend
npm run seed
```

### Test Questions API

**Get all questions:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/questions" -Method Get
```

**Add a question:**
```powershell
$body = @{
    question = "What is polymorphism?"
    category = "Technical"
    difficulty = "Medium"
    keywords = @("OOP", "inheritance", "interfaces")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/questions" -Method Post -Body $body -ContentType "application/json"
```

**Get random questions:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/questions/random?count=3&category=HR" -Method Get
```

### Test Sessions API

**Create session:**
```powershell
$sessionBody = @{
    candidateName = "Jane Smith"
} | ConvertTo-Json

$session = Invoke-RestMethod -Uri "http://localhost:5000/api/sessions" -Method Post -Body $sessionBody -ContentType "application/json"
$sessionId = $session.session._id
```

**Save response:**
```powershell
$responseBody = @{
    questionId = "QUESTION_ID_HERE"
    transcription = "I have 5 years of experience in software development..."
    score = 90
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/sessions/$sessionId/response" -Method Post -Body $responseBody -ContentType "application/json"
```

**Get session:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/sessions/$sessionId" -Method Get
```

---

## Expected MongoDB Collections

### questions
```json
{
  "_id": "ObjectId",
  "question": "String",
  "category": "HR|Technical|Behavioral",
  "difficulty": "Easy|Medium|Hard",
  "keywords": ["array", "of", "strings"],
  "createdAt": "Date"
}
```

### interviewsessions
```json
{
  "_id": "ObjectId",
  "candidateName": "String",
  "questions": ["ObjectId refs"],
  "responses": [
    {
      "questionId": "ObjectId ref",
      "audioURL": "String",
      "transcription": "String",
      "score": "Number",
      "answeredAt": "Date"
    }
  ],
  "overallScore": "Number",
  "feedback": {
    "strengths": ["String"],
    "weaknesses": ["String"],
    "summary": "String"
  },
  "createdAt": "Date",
  "completedAt": "Date"
}
```

---

## Common Issues

**MongoDB Connection Failed:**
- Ensure MongoDB is running locally: `mongod`
- Or update `.env` with MongoDB Atlas connection string

**Port 5000 Already in Use:**
- Change PORT in `.env` file
- Or stop the process using port 5000

**Validation Errors:**
- Check required fields in request body
- Ensure category/difficulty match enum values
