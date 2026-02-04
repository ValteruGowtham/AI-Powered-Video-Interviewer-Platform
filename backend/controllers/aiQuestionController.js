const OpenAI = require('openai');
const Question = require('../models/Question');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate interview questions using OpenAI
 * @param {string} topic - Job role or topic (e.g., "Software Engineer")
 * @param {string} difficulty - Easy, Medium, Hard, or Mixed
 * @param {string} category - HR, Technical, Behavioral, or Mixed
 * @param {number} count - Number of questions to generate (1-10)
 */
const generateQuestions = async (req, res) => {
  try {
    const { topic, difficulty, category, count } = req.body;

    // Validate inputs
    if (!topic || !topic.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Topic/job role is required' 
      });
    }

    const questionCount = Math.min(Math.max(parseInt(count) || 5, 1), 10);

    // Build prompt based on category and difficulty
    let categoryPrompt = category === 'Mixed' 
      ? 'a mix of HR, Technical, and Behavioral' 
      : category;
    
    let difficultyPrompt = difficulty === 'Mixed'
      ? 'varying difficulty levels (Easy, Medium, Hard)'
      : `${difficulty} difficulty`;

    const prompt = `You are an expert interview question generator. Generate ${questionCount} ${difficultyPrompt} ${categoryPrompt} interview questions for a ${topic} role.

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
]

Important:
- Questions should be relevant to ${topic} role
- Make questions diverse and realistic
- Keywords should be specific technical terms or concepts
- Return valid JSON only, no markdown or explanations`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview question generator. Always return valid JSON arrays only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Parse JSON response
    let generatedQuestions;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      generatedQuestions = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI response. Please try again.',
        error: parseError.message
      });
    }

    // Validate and format questions
    const formattedQuestions = generatedQuestions.map((q, index) => ({
      question: q.question || `Generated question ${index + 1}`,
      keywords: Array.isArray(q.keywords) ? q.keywords : [],
      category: ['HR', 'Technical', 'Behavioral'].includes(q.category) ? q.category : 'HR',
      difficulty: ['Easy', 'Medium', 'Hard'].includes(q.difficulty) ? q.difficulty : 'Medium',
      isAIGenerated: true,
      generatedFor: topic
    }));

    res.json({
      success: true,
      questions: formattedQuestions,
      count: formattedQuestions.length,
      topic
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    
    // Check if it's an OpenAI API error
    if (error.response) {
      return res.status(500).json({
        success: false,
        message: 'OpenAI API error. Please check your API key and try again.',
        error: error.response.data?.error?.message || error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate questions. Please try again.',
      error: error.message
    });
  }
};

/**
 * Save AI-generated questions to the database
 */
const saveGeneratedQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Questions array is required'
      });
    }

    // Validate each question has required fields
    const validQuestions = questions.filter(q => 
      q.question && 
      q.category && 
      q.difficulty
    );

    if (validQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid questions to save'
      });
    }

    // Save to database
    const savedQuestions = await Question.insertMany(validQuestions);

    res.json({
      success: true,
      message: `Successfully saved ${savedQuestions.length} questions to the bank`,
      questions: savedQuestions,
      count: savedQuestions.length
    });

  } catch (error) {
    console.error('Error saving generated questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save questions',
      error: error.message
    });
  }
};

/**
 * Regenerate a single question
 */
const regenerateSingleQuestion = async (req, res) => {
  try {
    const { topic, difficulty, category, originalQuestion } = req.body;

    const prompt = `You are an expert interview question generator. Generate 1 ${difficulty} ${category} interview question for a ${topic} role.

${originalQuestion ? `The original question was: "${originalQuestion}". Generate a different but similar question.` : ''}

Return ONLY a valid JSON object with this exact structure:
{
  "question": "question text here",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "category": "${category}",
  "difficulty": "${difficulty}"
}

Return valid JSON only, no markdown or explanations.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview question generator. Always return valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 500
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Parse JSON response
    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const regeneratedQuestion = JSON.parse(cleanedResponse);

    const formattedQuestion = {
      question: regeneratedQuestion.question,
      keywords: Array.isArray(regeneratedQuestion.keywords) ? regeneratedQuestion.keywords : [],
      category,
      difficulty,
      isAIGenerated: true,
      generatedFor: topic
    };

    res.json({
      success: true,
      question: formattedQuestion
    });

  } catch (error) {
    console.error('Error regenerating question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate question',
      error: error.message
    });
  }
};

module.exports = {
  generateQuestions,
  saveGeneratedQuestions,
  regenerateSingleQuestion
};
