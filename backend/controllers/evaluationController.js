const OpenAI = require('openai');
const Question = require('../models/Question');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Fallback keyword-based evaluation
const keywordBasedEvaluation = (answer, keywords) => {
  const answerLower = answer.toLowerCase();
  const matchedKeywords = keywords.filter(keyword => 
    answerLower.includes(keyword.toLowerCase())
  );
  const missingKeywords = keywords.filter(keyword => 
    !answerLower.includes(keyword.toLowerCase())
  );
  
  const score = Math.round((matchedKeywords.length / keywords.length) * 100);
  
  return {
    score,
    strengths: matchedKeywords.length > 0 
      ? [`Mentioned relevant concepts: ${matchedKeywords.join(', ')}`]
      : ['Provided a response'],
    weaknesses: missingKeywords.length > 0
      ? [`Could elaborate on: ${missingKeywords.join(', ')}`]
      : [],
    missingKeywords,
    feedback: `Your answer covered ${matchedKeywords.length} out of ${keywords.length} key concepts.`
  };
};

// AI-powered evaluation using OpenAI
exports.evaluateResponse = async (req, res) => {
  try {
    const { questionId, transcription } = req.body;

    if (!questionId || !transcription) {
      return res.status(400).json({ 
        message: 'Question ID and transcription are required' 
      });
    }

    // Fetch question details
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    let evaluation;

    // Try OpenAI evaluation first
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
      try {
        const prompt = `You are an expert interview evaluator. Evaluate this candidate's answer to an interview question.

Question: ${question.question}
Category: ${question.category}
Difficulty: ${question.difficulty}
Expected Keywords: ${question.keywords.join(', ')}

Candidate's Answer: ${transcription}

Provide a detailed evaluation in JSON format with the following structure:
{
  "score": <number between 0-100>,
  "strengths": [<array of 2-3 specific strengths>],
  "weaknesses": [<array of 1-2 areas for improvement>],
  "missingKeywords": [<array of important keywords not mentioned>],
  "feedback": "<brief 2-3 sentence summary of the answer quality>"
}

Be constructive and specific. Consider:
- Relevance to the question
- Use of technical/domain-specific terms
- Clarity and structure
- Completeness of the answer`;

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an expert interview evaluator. Always respond with valid JSON only."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        });

        const aiResponse = completion.choices[0].message.content;
        evaluation = JSON.parse(aiResponse);
        evaluation.evaluationType = 'AI';

      } catch (aiError) {
        console.error('OpenAI evaluation failed:', aiError.message);
        console.log('Falling back to keyword-based evaluation');
        evaluation = keywordBasedEvaluation(transcription, question.keywords);
        evaluation.evaluationType = 'Keyword';
      }
    } else {
      // Use keyword-based fallback if no API key
      console.log('No OpenAI API key configured. Using keyword-based evaluation.');
      evaluation = keywordBasedEvaluation(transcription, question.keywords);
      evaluation.evaluationType = 'Keyword';
    }

    res.json({
      message: 'Response evaluated successfully',
      question: {
        id: question._id,
        text: question.question,
        category: question.category,
        difficulty: question.difficulty
      },
      evaluation
    });

  } catch (err) {
    console.error('Evaluation error:', err);
    res.status(500).json({ 
      message: 'Error evaluating response',
      error: err.message 
    });
  }
};

// Evaluate entire session
exports.evaluateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const InterviewSession = require('../models/InterviewSession');

    const session = await InterviewSession.findById(sessionId)
      .populate('questions')
      .populate('responses.questionId');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Calculate overall score
    const scores = session.responses
      .filter(r => r.score !== null)
      .map(r => r.score);
    
    const overallScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    // Generate overall feedback
    const allStrengths = [];
    const allWeaknesses = [];

    // Collect strengths and weaknesses from individual responses
    // This would be populated if we stored evaluation details with responses
    
    const feedback = {
      strengths: allStrengths.length > 0 ? allStrengths : ['Completed the interview'],
      weaknesses: allWeaknesses.length > 0 ? allWeaknesses : ['Continue practicing'],
      summary: `You completed ${session.responses.length} questions with an average score of ${overallScore || 0}.`
    };

    // Update session with overall feedback
    session.overallScore = overallScore;
    session.feedback = feedback;
    session.completedAt = new Date();
    await session.save();

    res.json({
      message: 'Session evaluated successfully',
      session
    });

  } catch (err) {
    console.error('Session evaluation error:', err);
    res.status(500).json({ 
      message: 'Error evaluating session',
      error: err.message 
    });
  }
};
