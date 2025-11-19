const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate a relevant follow-up question based on the candidate's answer
 */
exports.generateFollowup = async (req, res) => {
  try {
    const { question, answer, context } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer are required'
      });
    }

    // Build context string
    let contextInfo = '';
    if (context) {
      if (context.resumeAnalysis) {
        const { suggested_job_profile, experience_level, skills } = context.resumeAnalysis;
        contextInfo = `Candidate Profile: ${suggested_job_profile} (${experience_level})
Skills: ${skills.slice(0, 5).join(', ')}`;
      } else if (context.jobProfile) {
        contextInfo = `Job Profile: ${context.jobProfile}`;
      }
    }

    const prompt = `You are conducting an interview. Based on the candidate's answer, generate ONE relevant follow-up question that digs deeper or clarifies their response.

Original Question: ${question}

Candidate's Answer: ${answer}

${contextInfo ? `Context:\n${contextInfo}\n` : ''}

Rules for follow-up question:
- Ask only ONE question
- Make it specific to their answer
- Dig deeper into details, examples, or challenges
- Don't repeat the original question
- Keep it conversational and natural
- Make it relevant to the job role

Return ONLY the follow-up question text, nothing else.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interviewer skilled at asking insightful follow-up questions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    const followupQuestion = response.choices[0].message.content.trim();

    // Remove quotes if AI wrapped the question
    const cleanedQuestion = followupQuestion.replace(/^["']|["']$/g, '');

    res.json({
      success: true,
      followupQuestion: cleanedQuestion,
      message: 'Follow-up question generated successfully'
    });
  } catch (error) {
    console.error('Follow-up generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating follow-up question'
    });
  }
};

/**
 * Generate multiple follow-up questions (if needed)
 */
exports.generateMultipleFollowups = async (req, res) => {
  try {
    const { questionAnswerPairs, context } = req.body;

    if (!Array.isArray(questionAnswerPairs) || questionAnswerPairs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Question-answer pairs are required'
      });
    }

    const followups = [];

    for (const pair of questionAnswerPairs) {
      try {
        const { question, answer } = pair;
        
        // Build context
        let contextInfo = '';
        if (context?.resumeAnalysis) {
          const { suggested_job_profile, experience_level } = context.resumeAnalysis;
          contextInfo = `Profile: ${suggested_job_profile} (${experience_level})`;
        } else if (context?.jobProfile) {
          contextInfo = `Profile: ${context.jobProfile}`;
        }

        const prompt = `Generate ONE follow-up question based on this interview exchange:

Q: ${question}
A: ${answer}
${contextInfo ? `Context: ${contextInfo}` : ''}

Return only the follow-up question text.`;

        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert interviewer. Generate brief, insightful follow-up questions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 100
        });

        const followupQuestion = response.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
        
        followups.push({
          originalQuestion: question,
          followupQuestion
        });
      } catch (err) {
        console.error('Error generating follow-up for question:', question, err);
        followups.push({
          originalQuestion: question,
          followupQuestion: null,
          error: 'Failed to generate follow-up'
        });
      }
    }

    res.json({
      success: true,
      followups,
      message: `Generated ${followups.length} follow-up questions`
    });
  } catch (error) {
    console.error('Multiple follow-up generation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating follow-up questions'
    });
  }
};
