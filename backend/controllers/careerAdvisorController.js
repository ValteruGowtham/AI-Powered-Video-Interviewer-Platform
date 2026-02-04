const OpenAI = require('openai');
const InterviewSession = require('../models/InterviewSession');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate personalized career advice based on interview performance
 */
exports.generateCareerAdvice = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Fetch session data
    const session = await InterviewSession.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    // Build comprehensive context
    const responses = session.responses || [];
    const followupQuestions = session.followupQuestions || [];
    const resumeAnalysis = session.resumeAnalysis;
    const jobProfile = session.jobProfile || 'General Professional';
    const overallScore = session.overallScore || 0;

    // Prepare interview data
    const interviewData = responses.map((r, index) => {
      const followup = followupQuestions.find(f => f.questionIndex === index);
      return `
Q${index + 1}: ${r.question}
Answer: ${r.transcription}
Score: ${r.evaluation?.score || 0}/100
Feedback: ${r.evaluation?.feedback || 'N/A'}
${followup ? `Follow-up Q: ${followup.question}\nFollow-up A: ${followup.answer || 'Not answered'}` : ''}
`.trim();
    }).join('\n\n');

    // Build resume context
    let resumeContext = '';
    if (resumeAnalysis) {
      resumeContext = `
Resume Analysis:
- Job Profile: ${resumeAnalysis.suggested_job_profile || jobProfile}
- Experience Level: ${resumeAnalysis.experience_level || 'N/A'}
- Skills: ${resumeAnalysis.skills?.join(', ') || 'N/A'}
- Education: ${resumeAnalysis.education?.highest_degree || 'N/A'} in ${resumeAnalysis.education?.field || 'N/A'}
- Key Projects: ${resumeAnalysis.key_projects?.join(', ') || 'N/A'}
`;
    }

    const prompt = `You are a senior career advisor analyzing an interview performance. Provide comprehensive career guidance.

TARGET ROLE: ${jobProfile}
OVERALL INTERVIEW SCORE: ${overallScore}/100

${resumeContext}

INTERVIEW PERFORMANCE:
${interviewData}

Based on this complete interview analysis, provide detailed career guidance in the following JSON format:

{
  "career_paths": [
    {
      "title": "Career path title",
      "description": "Why this path suits them",
      "timeline": "Short/Medium/Long term",
      "match_score": 0-100
    }
  ],
  "strengths": [
    {
      "strength": "Strength name",
      "evidence": "What demonstrated this",
      "leverage_how": "How to leverage this strength"
    }
  ],
  "skills_to_develop": [
    {
      "skill": "Skill name",
      "priority": "High/Medium/Low",
      "reason": "Why this skill is important",
      "learning_resources": ["Resource 1", "Resource 2"]
    }
  ],
  "recommended_learning": [
    {
      "course_name": "Course or certification name",
      "provider": "Platform/Provider",
      "timeline": "Weeks/Months to complete",
      "relevance": "Why important for their goals"
    }
  ],
  "improvement_timeline": {
    "3_months": ["Goal 1", "Goal 2"],
    "6_months": ["Goal 1", "Goal 2"],
    "12_months": ["Goal 1", "Goal 2"]
  },
  "industry_insights": [
    {
      "insight": "Industry trend or insight",
      "impact": "How it affects their career",
      "action": "What they should do about it"
    }
  ],
  "interview_performance_summary": "2-3 sentence summary of overall performance"
}

Provide specific, actionable advice based on their actual performance and background.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an experienced career advisor specializing in technology and professional development. Provide personalized, actionable career guidance based on interview performance and candidate background.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    let adviceText = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks
    adviceText = adviceText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const careerAdvice = JSON.parse(adviceText);

    // Save career advice to session
    session.careerAdvice = careerAdvice;
    await session.save();

    res.json({
      success: true,
      careerAdvice,
      message: 'Career advice generated successfully'
    });
  } catch (error) {
    console.error('Career advice generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating career advice'
    });
  }
};

/**
 * Get saved career advice for a session
 */
exports.getCareerAdvice = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await InterviewSession.findById(sessionId).select('careerAdvice jobProfile overallScore');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    if (!session.careerAdvice) {
      return res.status(404).json({
        success: false,
        message: 'No career advice generated for this session yet'
      });
    }

    res.json({
      success: true,
      careerAdvice: session.careerAdvice,
      jobProfile: session.jobProfile,
      overallScore: session.overallScore
    });
  } catch (error) {
    console.error('Get career advice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching career advice'
    });
  }
};

/**
 * Generate quick career tips (lightweight version)
 */
exports.generateQuickTips = async (req, res) => {
  try {
    const { jobProfile, skills, overallScore } = req.body;

    if (!jobProfile) {
      return res.status(400).json({
        success: false,
        message: 'Job profile is required'
      });
    }

    const prompt = `Provide 5 quick career tips for someone targeting a ${jobProfile} role.
${skills ? `Their skills: ${skills.join(', ')}` : ''}
${overallScore ? `Recent interview score: ${overallScore}/100` : ''}

Return a JSON array of 5 actionable tips:
[
  {
    "tip": "Tip text",
    "category": "Skill Development/Networking/Interview Prep/Career Growth"
  }
]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a career coach. Provide brief, actionable career tips.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    let tipsText = response.choices[0].message.content.trim();
    tipsText = tipsText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const tips = JSON.parse(tipsText);

    res.json({
      success: true,
      tips,
      message: 'Quick tips generated successfully'
    });
  } catch (error) {
    console.error('Quick tips generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating tips'
    });
  }
};
