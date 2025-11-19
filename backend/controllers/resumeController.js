const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const OpenAI = require('openai');
const Question = require('../models/Question');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Extract text from uploaded file (PDF or DOCX)
 */
const extractText = async (file) => {
  try {
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    let text = '';

    if (fileExtension === 'pdf') {
      // Extract text from PDF
      const dataBuffer = file.buffer;
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else if (fileExtension === 'docx' || fileExtension === 'doc') {
      // Extract text from DOCX
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      text = result.value;
    } else {
      throw new Error('Unsupported file format. Please upload PDF or DOCX only.');
    }

    // Clean up text
    text = text.replace(/\s+/g, ' ').trim();
    
    if (!text || text.length < 50) {
      throw new Error('Could not extract sufficient text from resume. Please check the file.');
    }

    return text;
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  }
};

/**
 * Analyze resume text using OpenAI
 */
const analyzeResume = async (text) => {
  try {
    const prompt = `Analyze the following resume and extract structured information in JSON format.

Resume Text:
${text}

Please extract and return ONLY a JSON object with the following structure (no markdown, no extra text):
{
  "skills": ["skill1", "skill2", ...],
  "experience": {
    "years": <number>,
    "summary": "brief summary of work experience"
  },
  "education": {
    "highest_degree": "degree name",
    "field": "field of study",
    "institution": "school name"
  },
  "key_projects": ["project1", "project2", ...],
  "suggested_job_profile": "recommended job title based on experience",
  "experience_level": "Junior/Mid-level/Senior/Expert"
}

Extract real information from the resume. If any field is not found, use null or empty array.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume analyzer. Extract structured information from resumes accurately and return valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    let analysisText = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const analysis = JSON.parse(analysisText);

    // Validate required fields
    if (!analysis.skills || !Array.isArray(analysis.skills)) {
      analysis.skills = [];
    }
    if (!analysis.suggested_job_profile) {
      analysis.suggested_job_profile = 'General Professional';
    }
    if (!analysis.experience_level) {
      analysis.experience_level = 'Mid-level';
    }

    return analysis;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to analyze resume. Please try again.');
  }
};

/**
 * Upload and analyze resume
 */
exports.uploadAndAnalyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Check file size (5MB limit)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false, 
        message: 'File size exceeds 5MB limit' 
      });
    }

    // Extract text from resume
    const text = await extractText(req.file);

    // Analyze resume using OpenAI
    const analysis = await analyzeResume(text);

    res.json({
      success: true,
      analysis,
      message: 'Resume analyzed successfully'
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error processing resume' 
    });
  }
};

/**
 * Generate interview questions based on resume analysis
 */
exports.generateQuestionsFromResume = async (req, res) => {
  try {
    const { resumeAnalysis, category, difficulty, count } = req.body;

    if (!resumeAnalysis || !resumeAnalysis.suggested_job_profile) {
      return res.status(400).json({ 
        success: false, 
        message: 'Resume analysis is required' 
      });
    }

    const jobProfile = resumeAnalysis.suggested_job_profile;
    const skills = resumeAnalysis.skills || [];
    const experienceLevel = resumeAnalysis.experience_level || 'Mid-level';
    const keyProjects = resumeAnalysis.key_projects || [];

    // Generate 60% resume-based questions and 40% standard questions
    const resumeBasedCount = Math.ceil(count * 0.6);
    const standardCount = count - resumeBasedCount;

    const prompt = `Generate ${count} interview questions for a ${jobProfile} position.

Candidate Profile:
- Experience Level: ${experienceLevel}
- Key Skills: ${skills.slice(0, 10).join(', ')}
- Notable Projects: ${keyProjects.slice(0, 3).join(', ')}

Requirements:
- Generate ${resumeBasedCount} questions specifically based on their skills and projects
- Generate ${standardCount} standard questions for the ${jobProfile} role
- Category: ${category === 'Mixed' ? 'HR, Technical, or Behavioral' : category}
- Difficulty: ${difficulty === 'Mixed' ? 'Easy, Medium, or Hard' : difficulty}

Return a JSON array with ${count} questions in this exact format:
[
  {
    "question": "question text",
    "category": "HR/Technical/Behavioral",
    "difficulty": "Easy/Medium/Hard",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "isAIGenerated": true,
    "generatedFor": "${jobProfile}",
    "resumeBased": true/false
  }
]

Make questions thoughtful, relevant, and specific to the candidate's background.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview question generator. Create relevant, insightful questions based on candidate resumes.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    let questionsText = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks
    questionsText = questionsText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const questions = JSON.parse(questionsText);

    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format received');
    }

    // Ensure all required fields
    const validatedQuestions = questions.map(q => ({
      question: q.question || '',
      category: q.category || category,
      difficulty: q.difficulty || difficulty,
      keywords: Array.isArray(q.keywords) ? q.keywords : [],
      isAIGenerated: true,
      generatedFor: jobProfile,
      resumeBased: q.resumeBased !== undefined ? q.resumeBased : true
    }));

    res.json({
      success: true,
      questions: validatedQuestions,
      message: `Generated ${validatedQuestions.length} questions based on resume`
    });
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error generating questions from resume' 
    });
  }
};

/**
 * Generate questions from manual job profile (no resume)
 */
exports.generateQuestionsFromProfile = async (req, res) => {
  try {
    const { jobProfile, category, difficulty, count } = req.body;

    if (!jobProfile) {
      return res.status(400).json({ 
        success: false, 
        message: 'Job profile is required' 
      });
    }

    const prompt = `Generate ${count} interview questions for a ${jobProfile} position.

Requirements:
- Category: ${category === 'Mixed' ? 'Mix of HR, Technical, and Behavioral' : category}
- Difficulty: ${difficulty === 'Mixed' ? 'Mix of Easy, Medium, and Hard' : difficulty}
- Make questions realistic and industry-relevant

Return a JSON array with ${count} questions in this exact format:
[
  {
    "question": "question text",
    "category": "HR/Technical/Behavioral",
    "difficulty": "Easy/Medium/Hard",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "isAIGenerated": true,
    "generatedFor": "${jobProfile}",
    "resumeBased": false
  }
]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview question generator. Create realistic, industry-relevant questions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    let questionsText = response.choices[0].message.content.trim();
    
    // Remove markdown code blocks
    questionsText = questionsText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    const questions = JSON.parse(questionsText);

    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format received');
    }

    // Ensure all required fields
    const validatedQuestions = questions.map(q => ({
      question: q.question || '',
      category: q.category || category,
      difficulty: q.difficulty || difficulty,
      keywords: Array.isArray(q.keywords) ? q.keywords : [],
      isAIGenerated: true,
      generatedFor: jobProfile,
      resumeBased: false
    }));

    res.json({
      success: true,
      questions: validatedQuestions,
      message: `Generated ${validatedQuestions.length} questions for ${jobProfile}`
    });
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error generating questions' 
    });
  }
};
