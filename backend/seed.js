const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');

dotenv.config();

const seedQuestions = [
  // HR Questions (3)
  {
    question: "Tell me about yourself and your professional background.",
    category: "HR",
    difficulty: "Easy",
    keywords: ["experience", "background", "education", "skills", "career", "professional", "journey"]
  },
  {
    question: "Why are you interested in this position and our company?",
    category: "HR",
    difficulty: "Medium",
    keywords: ["motivation", "interest", "company", "values", "culture", "growth", "opportunity", "align"]
  },
  {
    question: "Describe a time when you had to work with a difficult team member. How did you handle it?",
    category: "HR",
    difficulty: "Hard",
    keywords: ["conflict", "resolution", "communication", "teamwork", "diplomacy", "collaboration", "compromise"]
  },

  // Technical Questions (4)
  {
    question: "Explain the difference between var, let, and const in JavaScript.",
    category: "Technical",
    difficulty: "Easy",
    keywords: ["scope", "hoisting", "reassignment", "block", "function", "global", "temporal dead zone"]
  },
  {
    question: "What is the difference between SQL and NoSQL databases? When would you use each?",
    category: "Technical",
    difficulty: "Medium",
    keywords: ["relational", "document", "schema", "scalability", "ACID", "CAP", "use case", "structured", "unstructured"]
  },
  {
    question: "Explain how RESTful APIs work and describe the main HTTP methods.",
    category: "Technical",
    difficulty: "Medium",
    keywords: ["REST", "GET", "POST", "PUT", "DELETE", "PATCH", "stateless", "endpoint", "resource", "HTTP"]
  },
  {
    question: "How would you optimize a slow-performing database query? Walk me through your approach.",
    category: "Technical",
    difficulty: "Hard",
    keywords: ["indexing", "query plan", "normalization", "caching", "joins", "optimization", "performance", "bottleneck"]
  },

  // Behavioral Questions (3)
  {
    question: "Describe a challenging project you worked on. What obstacles did you face and how did you overcome them?",
    category: "Behavioral",
    difficulty: "Medium",
    keywords: ["challenge", "problem-solving", "obstacles", "solution", "teamwork", "persistence", "outcome", "learning"]
  },
  {
    question: "Tell me about a time when you failed. What did you learn from the experience?",
    category: "Behavioral",
    difficulty: "Hard",
    keywords: ["failure", "mistake", "learning", "growth", "reflection", "improvement", "accountability", "resilience"]
  },
  {
    question: "How do you prioritize tasks when you have multiple deadlines?",
    category: "Behavioral",
    difficulty: "Easy",
    keywords: ["prioritization", "time management", "deadlines", "organization", "planning", "urgent", "important", "strategy"]
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-mock-interviewer';
    
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(uri);
    console.log('✓ Connected to MongoDB');

    // Clear existing questions
    await Question.deleteMany({});
    console.log('✓ Cleared existing questions');

    // Insert seed questions
    const insertedQuestions = await Question.insertMany(seedQuestions);
    console.log(`✓ Inserted ${insertedQuestions.length} questions`);

    // Display summary
    const hrCount = await Question.countDocuments({ category: 'HR' });
    const techCount = await Question.countDocuments({ category: 'Technical' });
    const behavioralCount = await Question.countDocuments({ category: 'Behavioral' });

    console.log('\n✓ Database seeded successfully!');
    console.log('=================================');
    console.log(`HR Questions: ${hrCount}`);
    console.log(`Technical Questions: ${techCount}`);
    console.log(`Behavioral Questions: ${behavioralCount}`);
    console.log(`Total Questions: ${insertedQuestions.length}`);
    console.log('=================================\n');

    mongoose.connection.close();
    console.log('✓ Database connection closed');
  } catch (error) {
    console.error('\n✗ Error seeding database:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure MongoDB is running locally: mongod');
    console.log('2. Or use MongoDB Atlas and update MONGODB_URI in .env');
    console.log('3. Check connection string format\n');
    process.exit(1);
  }
};

seedDatabase();
