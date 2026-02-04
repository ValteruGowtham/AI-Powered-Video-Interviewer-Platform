/**
 * OpenAI Service
 * Centralized wrapper for OpenAI API calls with error handling and retry logic
 */

const OpenAI = require('openai');
const { OpenAIError } = require('./errorHandler');
const logger = require('./logger');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Default configuration
const DEFAULT_CONFIG = {
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  maxRetries: 2,
  retryDelay: 1000
};

/**
 * Check if OpenAI is configured
 */
const isConfigured = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  return apiKey && apiKey !== 'your-openai-api-key-here' && apiKey.length > 10;
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create a chat completion with retry logic
 * @param {Object} options - Chat completion options
 * @returns {Promise<Object>} - OpenAI response
 */
const createChatCompletion = async (options) => {
  if (!isConfigured()) {
    throw new OpenAIError('OpenAI API key not configured');
  }

  const config = { ...DEFAULT_CONFIG, ...options };
  let lastError;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      logger.debug(`OpenAI request attempt ${attempt}`, { model: config.model });

      const completion = await openai.chat.completions.create({
        model: config.model,
        messages: config.messages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 1000,
        response_format: config.responseFormat
      });

      logger.debug('OpenAI request successful', {
        usage: completion.usage
      });

      return completion;
    } catch (error) {
      lastError = error;
      logger.warn(`OpenAI request failed (attempt ${attempt})`, {
        error: error.message,
        status: error.status
      });

      // Don't retry on auth errors or rate limits
      if (error.status === 401 || error.status === 429) {
        break;
      }

      if (attempt < config.maxRetries) {
        await sleep(config.retryDelay * attempt);
      }
    }
  }

  throw new OpenAIError(
    lastError?.message || 'OpenAI API request failed',
    lastError
  );
};

/**
 * Parse JSON from OpenAI response, handling markdown code blocks
 * @param {string} content - Response content
 * @returns {Object} - Parsed JSON
 */
const parseJsonResponse = (content) => {
  try {
    // Remove markdown code blocks if present
    const cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleaned);
  } catch (error) {
    logger.error('Failed to parse OpenAI JSON response', { content });
    throw new OpenAIError('Failed to parse AI response');
  }
};

/**
 * Generate interview questions
 */
const generateQuestions = async ({ topic, category, difficulty, count }) => {
  const categoryPrompt = category === 'Mixed' 
    ? 'a mix of HR, Technical, and Behavioral' 
    : category;
  
  const difficultyPrompt = difficulty === 'Mixed'
    ? 'varying difficulty levels (Easy, Medium, Hard)'
    : `${difficulty} difficulty`;

  const prompt = `Generate ${count} ${difficultyPrompt} ${categoryPrompt} interview questions for a ${topic} role.

For each question, provide:
1. The question text (clear and professional)
2. 3-5 relevant keywords that should appear in a good answer
3. The category (HR, Technical, or Behavioral)
4. The difficulty level (Easy, Medium, or Hard)

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "question text here",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "category": "Technical",
    "difficulty": "Medium"
  }
]`;

  const completion = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: 'You are an expert interview question generator. Always return valid JSON arrays only.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.8,
    maxTokens: 2000
  });

  return parseJsonResponse(completion.choices[0].message.content);
};

/**
 * Evaluate an interview response
 */
const evaluateResponse = async ({ question, answer, category, difficulty, keywords }) => {
  const prompt = `Evaluate this interview answer:

Question: ${question}
Category: ${category}
Difficulty: ${difficulty}
Expected Keywords: ${keywords.join(', ')}

Candidate's Answer: ${answer}

Provide evaluation as JSON:
{
  "score": <0-100>,
  "strengths": [<2-3 specific strengths>],
  "weaknesses": [<1-2 areas for improvement>],
  "missingKeywords": [<important keywords not mentioned>],
  "feedback": "<2-3 sentence summary>"
}

Be constructive and specific.`;

  const completion = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: 'You are an expert interview evaluator. Always respond with valid JSON only.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    maxTokens: 500
  });

  return parseJsonResponse(completion.choices[0].message.content);
};

/**
 * Generate a follow-up question
 */
const generateFollowUp = async ({ originalQuestion, answer, score }) => {
  const prompt = `Based on this interview exchange, generate a follow-up question:

Original Question: ${originalQuestion}
Candidate's Answer: ${answer}
Score: ${score}/100

Generate a follow-up question that:
- Digs deeper into their response
- Tests understanding of concepts mentioned
- Is appropriate for their demonstrated level

Return JSON:
{
  "question": "follow-up question text",
  "purpose": "brief explanation of what this tests"
}`;

  const completion = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: 'You are an expert interviewer. Generate thoughtful follow-up questions.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    maxTokens: 300
  });

  return parseJsonResponse(completion.choices[0].message.content);
};

/**
 * Generate career advice based on interview performance
 */
const generateCareerAdvice = async ({ candidateName, overallScore, strengths, weaknesses, responses }) => {
  const prompt = `Provide career advice for a candidate based on their interview performance:

Candidate: ${candidateName}
Overall Score: ${overallScore}/100
Strengths: ${strengths.join(', ')}
Areas for Improvement: ${weaknesses.join(', ')}

Number of Questions: ${responses.length}

Provide personalized career advice as JSON:
{
  "summary": "2-3 sentence overall assessment",
  "recommendations": [<3-5 specific action items>],
  "resourceSuggestions": [<2-3 learning resources or areas to focus on>],
  "interviewTips": [<2-3 tips for future interviews>],
  "encouragement": "brief motivational message"
}`;

  const completion = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: 'You are an experienced career advisor. Provide helpful, actionable career guidance.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    maxTokens: 800
  });

  return parseJsonResponse(completion.choices[0].message.content);
};

module.exports = {
  openai,
  isConfigured,
  createChatCompletion,
  parseJsonResponse,
  generateQuestions,
  evaluateResponse,
  generateFollowUp,
  generateCareerAdvice
};
