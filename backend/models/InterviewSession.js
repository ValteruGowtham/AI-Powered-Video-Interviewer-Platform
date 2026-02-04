const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  question: {
    type: String,
    default: ''
  },
  audioURL: {
    type: String,
    default: null
  },
  transcription: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  evaluation: {
    score: Number,
    strengths: [String],
    weaknesses: [String],
    feedback: String,
    type: String
  },
  answeredAt: {
    type: Date,
    default: Date.now
  }
});

const followupQuestionSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    default: null
  },
  audioURL: {
    type: String,
    default: null
  },
  evaluation: {
    score: Number,
    feedback: String
  },
  answeredAt: {
    type: Date,
    default: null
  }
});

const interviewSessionSchema = new mongoose.Schema({
  candidateName: {
    type: String,
    required: true,
    trim: true
  },
  jobProfile: {
    type: String,
    default: null
  },
  questionMode: {
    type: String,
    enum: ['bank', 'ai_profile', 'ai_resume'],
    default: 'bank'
  },
  resumeAnalysis: {
    skills: [String],
    experience: {
      years: Number,
      summary: String
    },
    education: {
      highest_degree: String,
      field: String,
      institution: String
    },
    key_projects: [String],
    suggested_job_profile: String,
    experience_level: String
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  responses: [responseSchema],
  followupQuestions: [followupQuestionSchema],
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  feedback: {
    strengths: {
      type: [String],
      default: []
    },
    weaknesses: {
      type: [String],
      default: []
    },
    summary: {
      type: String,
      default: ''
    }
  },
  careerAdvice: {
    career_paths: [{
      title: String,
      description: String,
      timeline: String,
      match_score: Number
    }],
    strengths: [{
      strength: String,
      evidence: String,
      leverage_how: String
    }],
    skills_to_develop: [{
      skill: String,
      priority: String,
      reason: String,
      learning_resources: [String]
    }],
    recommended_learning: [{
      course_name: String,
      provider: String,
      timeline: String,
      relevance: String
    }],
    improvement_timeline: {
      "3_months": [String],
      "6_months": [String],
      "12_months": [String]
    },
    industry_insights: [{
      insight: String,
      impact: String,
      action: String
    }],
    interview_performance_summary: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
