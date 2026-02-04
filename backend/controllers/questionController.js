const Question = require('../models/Question');

// Add new question
exports.addQuestion = async (req, res) => {
  try {
    const { question, category, difficulty, keywords } = req.body;
    
    if (!question || !category || !difficulty) {
      return res.status(400).json({ 
        message: 'Question, category, and difficulty are required' 
      });
    }

    const newQuestion = new Question({
      question,
      category,
      difficulty,
      keywords: keywords || []
    });

    await newQuestion.save();
    res.status(201).json({
      message: 'Question added successfully',
      question: newQuestion
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all questions
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json({
      count: questions.length,
      questions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get questions by category
exports.getQuestionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!['HR', 'Technical', 'Behavioral'].includes(category)) {
      return res.status(400).json({ 
        message: 'Invalid category. Must be HR, Technical, or Behavioral' 
      });
    }

    const questions = await Question.find({ category }).sort({ createdAt: -1 });
    res.json({
      category,
      count: questions.length,
      questions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get questions by difficulty
exports.getQuestionsByDifficulty = async (req, res) => {
  try {
    const { difficulty } = req.params;
    
    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ 
        message: 'Invalid difficulty. Must be Easy, Medium, or Hard' 
      });
    }

    const questions = await Question.find({ difficulty }).sort({ createdAt: -1 });
    res.json({
      difficulty,
      count: questions.length,
      questions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get random questions
exports.getRandomQuestions = async (req, res) => {
  try {
    const { count = 5, category, difficulty } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(count) } }
    ]);

    res.json({
      count: questions.length,
      questions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const question = await Question.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({
      message: 'Question updated successfully',
      question
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({
      message: 'Question deleted successfully',
      question
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
