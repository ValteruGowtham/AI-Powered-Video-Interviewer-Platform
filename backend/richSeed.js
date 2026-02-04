require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Question = require('./models/Question');
const InterviewSession = require('./models/InterviewSession');

// Rich question bank with 25 diverse questions
const richQuestions = [
  // HR Questions - Easy (5)
  {
    text: "Tell me about yourself and your background.",
    category: "HR",
    difficulty: "Easy",
    expectedKeywords: ["experience", "education", "skills", "background", "career"]
  },
  {
    text: "Why are you interested in this position?",
    category: "HR",
    difficulty: "Easy",
    expectedKeywords: ["interest", "passion", "opportunity", "company", "role"]
  },
  {
    text: "What are your greatest strengths?",
    category: "HR",
    difficulty: "Easy",
    expectedKeywords: ["strength", "skills", "ability", "expertise", "talent"]
  },
  {
    text: "Where do you see yourself in five years?",
    category: "HR",
    difficulty: "Easy",
    expectedKeywords: ["goals", "growth", "career", "future", "development"]
  },
  {
    text: "Why should we hire you?",
    category: "HR",
    difficulty: "Easy",
    expectedKeywords: ["value", "contribution", "skills", "fit", "unique"]
  },

  // HR Questions - Medium (3)
  {
    text: "Describe a challenging situation you faced at work and how you handled it.",
    category: "HR",
    difficulty: "Medium",
    expectedKeywords: ["challenge", "problem", "solution", "overcome", "result"]
  },
  {
    text: "How do you handle criticism or feedback?",
    category: "HR",
    difficulty: "Medium",
    expectedKeywords: ["feedback", "improve", "learn", "constructive", "growth"]
  },
  {
    text: "What motivates you in your professional life?",
    category: "HR",
    difficulty: "Medium",
    expectedKeywords: ["motivation", "drive", "passion", "goals", "achievement"]
  },

  // HR Questions - Hard (2)
  {
    text: "Describe a time when you had to work with a difficult team member. How did you navigate that relationship?",
    category: "HR",
    difficulty: "Hard",
    expectedKeywords: ["conflict", "communication", "resolution", "teamwork", "collaboration"]
  },
  {
    text: "Tell me about a time when you failed. What did you learn from that experience?",
    category: "HR",
    difficulty: "Hard",
    expectedKeywords: ["failure", "lesson", "learning", "growth", "resilience"]
  },

  // Technical Questions - Easy (3)
  {
    text: "What programming languages are you most comfortable with and why?",
    category: "Technical",
    difficulty: "Easy",
    expectedKeywords: ["programming", "languages", "experience", "comfortable", "proficient"]
  },
  {
    text: "Explain what an API is and give an example of how you've used one.",
    category: "Technical",
    difficulty: "Easy",
    expectedKeywords: ["API", "interface", "communication", "integration", "endpoint"]
  },
  {
    text: "What is the difference between frontend and backend development?",
    category: "Technical",
    difficulty: "Easy",
    expectedKeywords: ["frontend", "backend", "user interface", "server", "database"]
  },

  // Technical Questions - Medium (4)
  {
    text: "Explain the concept of version control and why it's important.",
    category: "Technical",
    difficulty: "Medium",
    expectedKeywords: ["git", "version", "control", "collaboration", "repository"]
  },
  {
    text: "What is the difference between SQL and NoSQL databases?",
    category: "Technical",
    difficulty: "Medium",
    expectedKeywords: ["SQL", "NoSQL", "relational", "document", "structure"]
  },
  {
    text: "Describe the MVC architecture pattern.",
    category: "Technical",
    difficulty: "Medium",
    expectedKeywords: ["model", "view", "controller", "separation", "architecture"]
  },
  {
    text: "How would you optimize a slow-performing web application?",
    category: "Technical",
    difficulty: "Medium",
    expectedKeywords: ["performance", "optimize", "caching", "database", "code"]
  },

  // Technical Questions - Hard (3)
  {
    text: "Explain how you would design a scalable microservices architecture.",
    category: "Technical",
    difficulty: "Hard",
    expectedKeywords: ["microservices", "scalability", "distributed", "architecture", "design"]
  },
  {
    text: "Describe the differences between authentication and authorization, and how you would implement both.",
    category: "Technical",
    difficulty: "Hard",
    expectedKeywords: ["authentication", "authorization", "security", "JWT", "permissions"]
  },
  {
    text: "Walk me through how you would troubleshoot a production bug that only occurs intermittently.",
    category: "Technical",
    difficulty: "Hard",
    expectedKeywords: ["debugging", "logging", "monitoring", "reproduce", "analysis"]
  },

  // Behavioral Questions - Easy (2)
  {
    text: "How do you prioritize your work when you have multiple deadlines?",
    category: "Behavioral",
    difficulty: "Easy",
    expectedKeywords: ["prioritize", "organize", "deadline", "time management", "planning"]
  },
  {
    text: "Describe your ideal work environment.",
    category: "Behavioral",
    difficulty: "Easy",
    expectedKeywords: ["environment", "culture", "collaboration", "work style", "team"]
  },

  // Behavioral Questions - Medium (2)
  {
    text: "Tell me about a time when you had to learn a new technology quickly.",
    category: "Behavioral",
    difficulty: "Medium",
    expectedKeywords: ["learning", "adapt", "technology", "quick", "skill"]
  },
  {
    text: "Describe a project where you took the initiative to improve a process or system.",
    category: "Behavioral",
    difficulty: "Medium",
    expectedKeywords: ["initiative", "improvement", "process", "innovation", "proactive"]
  },

  // Behavioral Questions - Hard (1)
  {
    text: "Describe a situation where you had to make a difficult decision with incomplete information. How did you approach it?",
    category: "Behavioral",
    difficulty: "Hard",
    expectedKeywords: ["decision", "incomplete", "analysis", "risk", "judgment"]
  }
];

// Sample completed interview sessions
const sampleSessions = [
  {
    candidateName: "Sarah Johnson",
    category: "HR",
    difficulty: "Mixed",
    responses: [
      {
        questionText: "Tell me about yourself and your background.",
        candidateAnswer: "I have been working in software development for the past 5 years, primarily focusing on web applications. I graduated with a degree in Computer Science and have since worked at two tech companies where I developed my skills in both frontend and backend technologies. I'm passionate about creating user-friendly applications and enjoy collaborating with cross-functional teams.",
        score: 85,
        feedback: "Excellent response! You provided a clear overview of your background, mentioned specific experience, and showed enthusiasm. Consider adding a brief mention of a notable achievement to strengthen your answer further.",
        audioPath: null
      },
      {
        questionText: "Why are you interested in this position?",
        candidateAnswer: "I'm excited about this opportunity because it aligns perfectly with my career goals of working on innovative projects. Your company's focus on cutting-edge technology and commitment to professional development really appeals to me. I also admire the collaborative culture you've built.",
        score: 80,
        feedback: "Good answer showing genuine interest. You mentioned company research and alignment with goals. To improve, add specific examples of what attracts you about the company's projects or values.",
        audioPath: null
      },
      {
        questionText: "Describe a challenging situation you faced at work and how you handled it.",
        candidateAnswer: "In my previous role, we faced a critical production bug right before a major product launch. I took the initiative to assemble a task force, we isolated the issue through systematic debugging, implemented a fix, and deployed it within 24 hours. This experience taught me the importance of staying calm under pressure and effective communication.",
        score: 90,
        feedback: "Outstanding STAR method response! You clearly described the situation, your actions, and the positive result. Great demonstration of problem-solving and leadership skills.",
        audioPath: null
      }
    ],
    startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    overallScore: 85,
    summary: "Sarah demonstrated excellent communication skills and a strong professional background. Her responses showed good use of specific examples and the STAR method. She effectively conveyed her experience, enthusiasm, and problem-solving abilities. To further improve, she could incorporate more quantifiable achievements and metrics in her answers."
  },
  {
    candidateName: "Michael Chen",
    category: "Technical",
    difficulty: "Medium",
    responses: [
      {
        questionText: "What is the difference between SQL and NoSQL databases?",
        candidateAnswer: "SQL databases are relational and use structured tables with predefined schemas, while NoSQL databases are non-relational and can store data in various formats like documents or key-value pairs. SQL is great for complex queries and transactions, while NoSQL offers more flexibility and scalability for large-scale applications. I've used both PostgreSQL and MongoDB in my projects.",
        score: 88,
        feedback: "Excellent technical explanation! You covered the key differences clearly and mentioned practical experience. Strong answer demonstrating both theoretical knowledge and hands-on experience.",
        audioPath: null
      },
      {
        questionText: "Explain the concept of version control and why it's important.",
        candidateAnswer: "Version control systems like Git allow developers to track changes in code over time, collaborate effectively, and maintain different versions of a project. It's crucial because it enables team collaboration, provides a history of changes, allows reverting to previous versions, and helps manage different features through branching. I use Git daily in my workflow.",
        score: 85,
        feedback: "Very good explanation covering the main benefits of version control. You mentioned Git specifically and practical usage. Well-structured answer.",
        audioPath: null
      },
      {
        questionText: "How would you optimize a slow-performing web application?",
        candidateAnswer: "I would start by identifying bottlenecks using performance profiling tools. Common optimizations include database query optimization with indexing, implementing caching strategies, code splitting and lazy loading for frontend, optimizing images and assets, and using CDNs. I'd also consider server-side optimizations like load balancing and horizontal scaling if needed.",
        score: 92,
        feedback: "Exceptional answer! You provided a systematic approach with multiple specific optimization techniques across different layers of the application. This demonstrates comprehensive understanding of performance optimization.",
        audioPath: null
      }
    ],
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
    overallScore: 88,
    summary: "Michael showed strong technical knowledge and practical experience. His answers were well-structured, specific, and demonstrated both theoretical understanding and real-world application. He effectively used technical terminology and provided concrete examples. His systematic approach to problem-solving was particularly impressive. Continue practicing articulating complex concepts in simple terms."
  },
  {
    candidateName: "Emily Rodriguez",
    category: "Behavioral",
    difficulty: "Medium",
    responses: [
      {
        questionText: "How do you prioritize your work when you have multiple deadlines?",
        candidateAnswer: "I use a combination of priority matrices and project management tools to organize tasks. I assess urgency and importance, communicate with stakeholders about timelines, and break larger projects into manageable chunks. I also make sure to build in buffer time for unexpected issues and regularly review my priorities as situations change.",
        score: 82,
        feedback: "Good answer showing organized approach to time management. You mentioned specific tools and methods. Consider adding a concrete example of when this approach helped you successfully manage competing priorities.",
        audioPath: null
      },
      {
        questionText: "Tell me about a time when you had to learn a new technology quickly.",
        candidateAnswer: "When our team decided to migrate to React, I had only two weeks to get up to speed. I created a learning plan that included online courses, documentation, and building small practice projects. I also joined React community forums and paired with experienced developers. Within the deadline, I successfully contributed to the migration project and even helped onboard other team members later.",
        score: 90,
        feedback: "Excellent STAR response! You clearly outlined the challenge, your strategic approach to learning, and the positive outcome. Great demonstration of adaptability and initiative.",
        audioPath: null
      },
      {
        questionText: "Describe a project where you took the initiative to improve a process or system.",
        candidateAnswer: "I noticed our code review process was causing delays, so I proposed and implemented a new workflow using automated testing and clearer review guidelines. I gathered feedback from the team, documented best practices, and set up CI/CD pipelines. This reduced our review time by 40% and improved code quality. The team really appreciated the efficiency gains.",
        score: 87,
        feedback: "Strong answer with quantifiable results! You showed initiative, leadership, and the ability to drive positive change. Including team collaboration makes this even more compelling.",
        audioPath: null
      }
    ],
    startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 28 * 60 * 1000),
    overallScore: 86,
    summary: "Emily demonstrated excellent behavioral competencies with strong examples of adaptability, initiative, and problem-solving. Her use of the STAR method was consistent and effective. She provided specific metrics and outcomes which strengthened her responses. Her answers showed both technical capability and soft skills. To enhance further, she could add more details about stakeholder management and cross-functional collaboration."
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await Question.deleteMany({});
    await InterviewSession.deleteMany({});

    // Insert rich question bank
    console.log('Inserting 25 diverse questions...');
    const insertedQuestions = await Question.insertMany(richQuestions);
    console.log(`✅ Successfully inserted ${insertedQuestions.length} questions`);

    // Display question breakdown
    const hrCount = insertedQuestions.filter(q => q.category === 'HR').length;
    const technicalCount = insertedQuestions.filter(q => q.category === 'Technical').length;
    const behavioralCount = insertedQuestions.filter(q => q.category === 'Behavioral').length;
    
    console.log('\nQuestion Breakdown:');
    console.log(`  HR: ${hrCount} questions`);
    console.log(`  Technical: ${technicalCount} questions`);
    console.log(`  Behavioral: ${behavioralCount} questions`);
    
    const easyCount = insertedQuestions.filter(q => q.difficulty === 'Easy').length;
    const mediumCount = insertedQuestions.filter(q => q.difficulty === 'Medium').length;
    const hardCount = insertedQuestions.filter(q => q.difficulty === 'Hard').length;
    
    console.log('\nDifficulty Breakdown:');
    console.log(`  Easy: ${easyCount} questions`);
    console.log(`  Medium: ${mediumCount} questions`);
    console.log(`  Hard: ${hardCount} questions`);

    // Insert sample sessions
    console.log('\nInserting 3 sample completed sessions...');
    const insertedSessions = await InterviewSession.insertMany(sampleSessions);
    console.log(`✅ Successfully inserted ${insertedSessions.length} sample sessions`);

    console.log('\nSample Sessions:');
    insertedSessions.forEach((session, index) => {
      console.log(`  ${index + 1}. ${session.candidateName} - ${session.category} (Score: ${session.overallScore})`);
    });

    console.log('\n🎉 Rich database seeding completed successfully!');
    console.log('\nYou can now:');
    console.log('  - Practice interviews with 25 diverse questions');
    console.log('  - View 3 sample completed sessions in the admin panel');
    console.log('  - Test all difficulty levels and categories');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
