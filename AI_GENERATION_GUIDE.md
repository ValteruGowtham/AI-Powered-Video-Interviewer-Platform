# 🤖 AI Question Generation Guide

## Overview

The AI Question Generation feature allows the platform to dynamically create role-specific interview questions using OpenAI GPT-3.5. This guide explains the feature architecture, usage, and implementation details.

## Feature Architecture

### Hybrid Question Mode System

The platform supports two distinct modes for interview questions:

```
┌─────────────────────────────────────────┐
│         Interview Question Modes         │
├─────────────────────────────────────────┤
│                                          │
│  ┌────────────────┐  ┌────────────────┐ │
│  │  Question Bank │  │  AI Generated  │ │
│  │      Mode      │  │      Mode      │ │
│  └────────────────┘  └────────────────┘ │
│         ↓                     ↓          │
│  ┌────────────────┐  ┌────────────────┐ │
│  │   Pre-curated  │  │ Fresh, role-   │ │
│  │   questions    │  │ specific Qs    │ │
│  │   from DB      │  │ from OpenAI    │ │
│  └────────────────┘  └────────────────┘ │
│         ↓                     ↓          │
│         └─────────┬───────────┘          │
│                   ↓                      │
│           ┌──────────────┐               │
│           │   Fallback   │               │
│           │ to Bank Mode │               │
│           │  (if AI fails)│              │
│           └──────────────┘               │
└─────────────────────────────────────────┘
```

## Backend Implementation

### 1. Question Model Enhancement

**File:** `backend/models/Question.js`

Added two new fields to track AI-generated questions:

```javascript
{
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  generatedFor: {
    type: String,
    default: null
  }
}
```

### 2. AI Question Controller

**File:** `backend/controllers/aiQuestionController.js`

Three main functions:

#### `generateQuestions(topic, difficulty, category, count)`
- Calls OpenAI GPT-3.5-turbo API
- Uses structured prompt for JSON generation
- Parses and validates response
- Returns formatted question objects

**OpenAI Prompt Structure:**
```
Generate {count} {difficulty} {category} interview questions for a {topic}.
Return as JSON array with:
- question: string
- category: string
- difficulty: string
- keywords: array[5]
- isAIGenerated: true
- generatedFor: string
```

#### `saveGeneratedQuestions(questions)`
- Saves array of questions to MongoDB
- Automatically marks as AI-generated
- Returns saved question objects

#### `regenerateSingleQuestion(topic, difficulty, category, originalQuestion)`
- Generates replacement for specific question
- Uses higher temperature for more variety
- Excludes original question from results

### 3. API Routes

**File:** `backend/routes/aiQuestionRoutes.js`

**Endpoints:**
- `POST /api/ai-questions/generate` - Generate questions (rate limited: 30 req/15min)
- `POST /api/ai-questions/save` - Save to database
- `POST /api/ai-questions/regenerate` - Regenerate single question (rate limited)

**Rate Limiting:**
```javascript
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  message: 'Too many AI requests, please try again later'
});
```

## Frontend Implementation

### 1. Admin Panel - AI Generator Tab

**File:** `frontend/src/pages/Admin.jsx`

**New State Variables:**
```javascript
const [filterSource, setFilterSource] = useState('all');
const [aiGeneratorForm, setAiGeneratorForm] = useState({
  topic: '',
  category: 'Technical',
  difficulty: 'Medium',
  count: 5
});
const [generatedQuestions, setGeneratedQuestions] = useState([]);
const [isGenerating, setIsGenerating] = useState(false);
const [generateError, setGenerateError] = useState(null);
```

**Key Functions:**
- `handleGenerateAIQuestions()` - Calls generation API
- `handleSaveGeneratedQuestion()` - Saves single question
- `handleRegenerateQuestion()` - Regenerates specific question
- `handleDiscardQuestion()` - Removes from preview
- `handleSaveAllGenerated()` - Saves all at once

**UI Components:**
- Form with topic input, selectors, and slider
- Generated questions preview grid
- Individual question cards with actions
- Source filter for question bank (All/AI/Manual)
- AI/Manual badges on all questions

### 2. Interview Page - Mode Selection

**File:** `frontend/src/pages/Interview.jsx`

**New Settings State:**
```javascript
const [interviewSettings, setInterviewSettings] = useState({
  candidateName: '',
  category: 'Mixed',
  difficulty: 'Mixed',
  numQuestions: 5,
  mode: 'bank',           // NEW: 'bank' or 'ai'
  aiTopic: ''             // NEW: job role for AI
});
```

**Updated `handleStart()` Function:**
```javascript
const handleStart = async () => {
  if (interviewSettings.mode === 'ai') {
    try {
      // Generate AI questions
      const response = await axios.post(
        'http://localhost:5000/api/ai-questions/generate',
        {
          topic: interviewSettings.aiTopic,
          category: interviewSettings.category,
          difficulty: interviewSettings.difficulty,
          count: interviewSettings.numQuestions
        }
      );
      
      if (response.data.questions?.length > 0) {
        setQuestions(response.data.questions);
        // Continue with interview
      }
    } catch (error) {
      // Fallback to question bank
      showToast('AI generation failed. Using question bank.', 'warning');
      // Use existing question bank logic
    }
  } else {
    // Use question bank mode (existing logic)
  }
};
```

**UI Enhancements:**
- Mode toggle buttons (Question Bank vs AI Generated)
- Conditional AI topic input field
- Mode indicator in question counter during interview
- Toast notifications for AI generation status

## User Workflows

### Admin Workflow: Generate & Save Questions

```
1. Navigate to Admin Panel
   ↓
2. Click "🤖 AI Generator" tab
   ↓
3. Enter job role (e.g., "Python Backend Developer")
   ↓
4. Select category (e.g., "Technical")
   ↓
5. Select difficulty (e.g., "Hard")
   ↓
6. Choose count (e.g., 5)
   ↓
7. Click "Generate Questions"
   ↓
8. Wait 3-5 seconds (OpenAI API call)
   ↓
9. Preview generated questions
   ↓
10. Options:
    - Save all questions
    - Save individual questions
    - Regenerate specific questions
    - Discard unwanted questions
   ↓
11. Saved questions appear in Question Bank
    with 🤖 AI badge
```

### Candidate Workflow: AI Interview Mode

```
1. Navigate to Interview Page
   ↓
2. Enter name
   ↓
3. Select "🤖 AI Generated" mode
   ↓
4. Enter target role (e.g., "Senior React Developer")
   ↓
5. Configure category & difficulty
   ↓
6. Click "Start Interview"
   ↓
7. System generates fresh questions via AI
   ↓
8. If successful:
   - Interview starts with AI-generated questions
   - Mode indicator shows "🤖 AI Generated"
   ↓
9. If AI fails:
   - Automatic fallback to question bank
   - Toast notification shown
   - Mode indicator shows "✍️ Curated"
   ↓
10. Complete interview normally
   ↓
11. View performance report
```

## Benefits by Mode

### Question Bank Mode
✅ **Instant Start** - No waiting for generation  
✅ **100% Reliable** - No API dependencies  
✅ **Proven Questions** - Tested and validated  
✅ **Consistent** - Same questions for all users  
✅ **Best For:** General practice, common questions

### AI Generation Mode
✅ **Role-Specific** - Tailored to job target  
✅ **Fresh Content** - Unique every time  
✅ **Contextual** - Matches your skill level  
✅ **Adaptive** - Questions fit your topic  
✅ **Best For:** Targeted prep, niche roles

## Error Handling & Fallback

### Fallback Triggers

1. **OpenAI API Failure**
   - Invalid API key
   - Rate limit exceeded
   - Network timeout
   - Service unavailable

2. **Response Parsing Issues**
   - Invalid JSON format
   - Missing required fields
   - Empty response

3. **Question Validation Errors**
   - Insufficient questions generated
   - Quality checks failed

### Fallback Behavior

```javascript
try {
  // Attempt AI generation
  const aiQuestions = await generateAI();
  setQuestions(aiQuestions);
} catch (error) {
  // Automatic fallback
  showToast('Using question bank instead', 'warning');
  const bankQuestions = await fetchFromBank();
  setQuestions(bankQuestions);
  setInterviewSettings({...settings, mode: 'bank'});
}
```

## Rate Limiting

### API Limits

**General Endpoints:** 100 requests / 15 minutes  
**AI Generation:** 30 requests / 15 minutes  
**AI Regeneration:** 30 requests / 15 minutes

### Why Rate Limiting?

1. **Cost Control** - OpenAI API usage costs money
2. **Abuse Prevention** - Prevent spam/misuse
3. **Fair Usage** - Equal access for all users
4. **Service Protection** - Maintain system stability

## Cost Considerations

### OpenAI API Costs (as of 2024)

**GPT-3.5-turbo Pricing:**
- Input: $0.50 / 1M tokens
- Output: $1.50 / 1M tokens

**Average Cost Per Request:**
- 5 questions ≈ 1,000 tokens
- Cost ≈ $0.0015 per generation
- 1000 generations ≈ $1.50

### Cost Optimization

✅ **Rate limiting** - Prevents excessive usage  
✅ **Caching** - Save generated questions to DB  
✅ **Reuse** - Saved questions available for all users  
✅ **Fallback** - Uses free question bank when possible

## Testing Checklist

### Backend Testing

- [ ] AI generation endpoint returns valid questions
- [ ] Rate limiting enforces 30 req/15min
- [ ] Save endpoint persists to MongoDB
- [ ] Regenerate endpoint creates different question
- [ ] Error handling returns appropriate messages
- [ ] Questions include all required fields
- [ ] isAIGenerated flag is set correctly

### Admin Panel Testing

- [ ] AI Generator tab renders correctly
- [ ] Form validation works (required fields)
- [ ] Generate button shows loading state
- [ ] Generated questions display in grid
- [ ] Save individual question works
- [ ] Regenerate individual question works
- [ ] Discard question removes from preview
- [ ] Save all questions works
- [ ] Filter shows AI vs Manual questions
- [ ] Badges display correctly on questions

### Interview Page Testing

- [ ] Mode toggle switches between modes
- [ ] AI topic field shows/hides based on mode
- [ ] AI topic field is required when mode is 'ai'
- [ ] AI generation toast notifications appear
- [ ] Questions generate successfully in AI mode
- [ ] Mode indicator shows correct mode during interview
- [ ] Fallback to question bank works when AI fails
- [ ] Question bank mode still works normally
- [ ] Both modes complete interview successfully

### Integration Testing

- [ ] Generate questions in admin → appears in bank
- [ ] Interview uses AI mode → generates fresh questions
- [ ] Interview uses bank mode → uses saved questions
- [ ] AI failure → fallback works seamlessly
- [ ] Rate limit reached → appropriate error shown
- [ ] Invalid API key → fallback triggers
- [ ] Network timeout → fallback triggers

## Troubleshooting

### "Failed to generate questions"

**Possible Causes:**
- Invalid OpenAI API key
- Insufficient API credits
- Rate limit exceeded
- Network issues

**Solutions:**
1. Verify API key in `.env` file
2. Check OpenAI account balance
3. Wait 15 minutes if rate limited
4. Check internet connection
5. Review backend console logs

### Generated questions are poor quality

**Solutions:**
1. Be more specific with topic/role
2. Use appropriate difficulty level
3. Regenerate individual questions
4. Add context to topic field

### Questions not saving to database

**Solutions:**
1. Check MongoDB connection
2. Verify save button was clicked
3. Check browser console for errors
4. Refresh admin panel

## Future Enhancements

### Potential Improvements

1. **Question Rating System**
   - Users rate AI-generated questions
   - Low-rated questions flagged for review
   - Train model on highly-rated questions

2. **Advanced Filtering**
   - Filter by company type
   - Filter by experience level
   - Filter by technology stack

3. **Question Templates**
   - Save AI generation presets
   - Reuse successful configurations
   - Share templates between admins

4. **Analytics Dashboard**
   - Track AI vs Bank mode usage
   - Monitor AI generation success rate
   - Cost tracking and budgeting

5. **Batch Operations**
   - Generate multiple question sets
   - Bulk edit AI-generated questions
   - Export/import question sets

6. **Model Options**
   - Support GPT-4 for higher quality
   - Allow model selection per request
   - A/B test different models

## Security Best Practices

### API Key Protection

✅ Store in `.env` file (never commit)  
✅ Use environment variables  
✅ Rotate keys periodically  
✅ Monitor usage in OpenAI dashboard

### Rate Limiting

✅ Implement on all AI endpoints  
✅ Use per-IP or per-user limits  
✅ Log excessive usage attempts  
✅ Alert on suspicious patterns

### Input Validation

✅ Validate all user inputs  
✅ Sanitize topic/role fields  
✅ Limit input length  
✅ Prevent injection attacks

### Response Validation

✅ Verify JSON structure  
✅ Check required fields exist  
✅ Validate data types  
✅ Sanitize AI-generated content

## Conclusion

The AI Question Generation feature significantly enhances the platform by:

- 🎯 **Personalization** - Questions tailored to specific roles
- 🔄 **Variety** - Fresh content every time
- ⚡ **Flexibility** - Choose mode based on needs
- 🛡️ **Reliability** - Fallback ensures continuity
- 📊 **Scalability** - Unlimited question combinations

The hybrid approach balances innovation with reliability, giving users the best of both worlds.
