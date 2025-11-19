const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['HR', 'Technical', 'Behavioral'],
    default: 'HR'
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  keywords: {
    type: [String],
    default: []
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  generatedFor: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', questionSchema);
