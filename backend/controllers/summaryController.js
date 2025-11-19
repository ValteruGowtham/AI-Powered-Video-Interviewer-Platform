const OpenAI = require('openai');
const InterviewSession = require('../models/InterviewSession');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate overall summary for completed interview
exports.generateSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Fetch the session with all responses
    const session = await InterviewSession.findById(sessionId)
      .populate('questions')
      .populate('responses.questionId');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.responses.length === 0) {
      return res.status(400).json({ message: 'No responses found for this session' });
    }

    // Calculate overall score
    const scores = session.responses
      .filter(r => r.score !== null && r.score !== undefined)
      .map(r => r.score);
    
    const overallScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
      : 0;

    // Prepare context for OpenAI
    const responsesContext = session.responses.map((response, index) => {
      const question = response.questionId;
      return `
Question ${index + 1} (${question.category} - ${question.difficulty}):
Q: ${question.question}
A: ${response.transcription}
Score: ${response.score || 'N/A'}/100
`;
    }).join('\n');

    try {
      // Call OpenAI to generate comprehensive summary
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert interview evaluator. Analyze the candidate's overall interview performance and provide a comprehensive summary. Focus on patterns across all responses, communication skills, technical depth, and soft skills. Be constructive and specific.`
          },
          {
            role: 'user',
            content: `Analyze this interview session and provide a comprehensive evaluation:

Candidate: ${session.candidateName}
Number of Questions: ${session.responses.length}
Overall Score: ${overallScore}/100

Interview Responses:
${responsesContext}

Provide a JSON response with:
{
  "overallStrengths": ["strength 1", "strength 2", "strength 3"],
  "areasToImprove": ["area 1", "area 2", "area 3"],
  "categoryBreakdown": {
    "technical": "assessment of technical skills",
    "communication": "assessment of communication skills",
    "problemSolving": "assessment of problem-solving approach"
  },
  "finalRecommendation": "Overall recommendation and next steps for the candidate"
}`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const aiSummary = JSON.parse(completion.choices[0].message.content);

      // Update session with AI summary
      session.overallScore = overallScore;
      session.feedback = {
        strengths: aiSummary.overallStrengths || [],
        weaknesses: aiSummary.areasToImprove || [],
        summary: [
          aiSummary.categoryBreakdown?.technical || '',
          aiSummary.categoryBreakdown?.communication || '',
          aiSummary.categoryBreakdown?.problemSolving || '',
          aiSummary.finalRecommendation || ''
        ].filter(s => s)
      };
      session.completedAt = new Date();

      await session.save();
      await session.populate('questions responses.questionId');

      res.json({
        message: 'Summary generated successfully',
        summary: {
          overallScore,
          ...aiSummary
        },
        session
      });

    } catch (openaiError) {
      console.error('OpenAI error:', openaiError);
      
      // Fallback summary generation
      const fallbackSummary = generateFallbackSummary(session, overallScore);
      
      session.overallScore = overallScore;
      session.feedback = fallbackSummary;
      session.completedAt = new Date();
      
      await session.save();
      await session.populate('questions responses.questionId');

      res.json({
        message: 'Summary generated successfully (fallback)',
        summary: {
          overallScore,
          overallStrengths: fallbackSummary.strengths,
          areasToImprove: fallbackSummary.weaknesses,
          finalRecommendation: fallbackSummary.summary.join(' ')
        },
        session,
        evaluationType: 'Fallback'
      });
    }

  } catch (err) {
    console.error('Summary generation error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Fallback summary generation
function generateFallbackSummary(session, overallScore) {
  const strengths = [];
  const weaknesses = [];
  const summary = [];

  // Analyze based on score
  if (overallScore >= 80) {
    strengths.push('Strong overall performance across questions');
    strengths.push('Demonstrated good understanding of concepts');
    summary.push('Excellent interview performance with solid answers.');
  } else if (overallScore >= 60) {
    strengths.push('Adequate responses to most questions');
    weaknesses.push('Some areas need more depth and detail');
    summary.push('Good interview performance with room for improvement.');
  } else {
    weaknesses.push('Responses need more depth and clarity');
    weaknesses.push('Consider practicing common interview questions');
    summary.push('Interview performance shows potential but needs significant improvement.');
  }

  // Analyze by category
  const categories = {};
  session.responses.forEach(response => {
    const category = response.questionId?.category || 'General';
    if (!categories[category]) categories[category] = [];
    if (response.score) categories[category].push(response.score);
  });

  Object.entries(categories).forEach(([category, scores]) => {
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avgScore >= 75) {
      strengths.push(`Strong ${category} skills demonstrated`);
    } else if (avgScore < 60) {
      weaknesses.push(`${category} skills need improvement`);
    }
  });

  // General recommendations
  summary.push('Continue practicing interview skills and technical concepts.');
  summary.push('Focus on providing clear, structured answers with specific examples.');

  return { strengths, weaknesses, summary };
}

module.exports = exports;
