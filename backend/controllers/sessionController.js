const InterviewSession = require('../models/InterviewSession');
const Question = require('../models/Question');

// Create new interview session
exports.createSession = async (req, res) => {
  try {
    const { candidateName, questionIds, jobProfile, questionMode, resumeAnalysis } = req.body;

    if (!candidateName) {
      return res.status(400).json({ message: 'Candidate name is required' });
    }

    // If no question IDs provided, get 5 random questions
    let questions = questionIds || [];
    if (!questions.length) {
      const randomQuestions = await Question.aggregate([
        { $sample: { size: 5 } }
      ]);
      questions = randomQuestions.map(q => q._id);
    }

    const session = new InterviewSession({
      candidateName,
      questions,
      jobProfile: jobProfile || null,
      questionMode: questionMode || 'bank',
      resumeAnalysis: resumeAnalysis || null
    });

    await session.save();
    await session.populate('questions');

    res.status(201).json({
      message: 'Interview session created successfully',
      session
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Save response to a question
exports.saveResponse = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, transcription, score } = req.body;

    if (!questionId || !transcription) {
      return res.status(400).json({ 
        message: 'Question ID and transcription are required' 
      });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if response already exists for this question
    const existingResponseIndex = session.responses.findIndex(
      r => r.questionId.toString() === questionId
    );

    // Get audio file path if uploaded
    const audioURL = req.file ? `/uploads/${req.file.filename}` : null;

    const responseData = {
      questionId,
      audioURL,
      transcription,
      score: score || null,
      answeredAt: new Date()
    };

    if (existingResponseIndex !== -1) {
      // Update existing response
      session.responses[existingResponseIndex] = responseData;
    } else {
      // Add new response
      session.responses.push(responseData);
    }

    await session.save();
    await session.populate('questions responses.questionId');

    res.json({
      message: 'Response saved successfully',
      session
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get session by ID
exports.getSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await InterviewSession.findById(sessionId)
      .populate('questions')
      .populate('responses.questionId');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all sessions
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await InterviewSession.find()
      .populate('questions')
      .sort({ createdAt: -1 });

    res.json({
      count: sessions.length,
      sessions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update session feedback and score
exports.updateSessionFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { overallScore, feedback } = req.body;

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (overallScore !== undefined) {
      session.overallScore = overallScore;
    }

    if (feedback) {
      session.feedback = {
        strengths: feedback.strengths || session.feedback.strengths,
        weaknesses: feedback.weaknesses || session.feedback.weaknesses,
        summary: feedback.summary || session.feedback.summary
      };
    }

    session.completedAt = new Date();
    await session.save();
    await session.populate('questions responses.questionId');

    res.json({
      message: 'Session feedback updated successfully',
      session
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete session
exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await InterviewSession.findByIdAndDelete(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({
      message: 'Session deleted successfully',
      session
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Save follow-up question response
exports.saveFollowupResponse = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionIndex, question, answer } = req.body;

    if (questionIndex === undefined || !question) {
      return res.status(400).json({ 
        message: 'Question index and question are required' 
      });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if follow-up already exists for this question index
    const existingIndex = session.followupQuestions.findIndex(
      f => f.questionIndex === questionIndex
    );

    const followupData = {
      questionIndex,
      question,
      answer: answer || null,
      answeredAt: answer ? new Date() : null
    };

    if (existingIndex !== -1) {
      // Update existing follow-up
      session.followupQuestions[existingIndex] = followupData;
    } else {
      // Add new follow-up
      session.followupQuestions.push(followupData);
    }

    await session.save();

    res.json({
      message: 'Follow-up response saved successfully',
      followup: followupData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
