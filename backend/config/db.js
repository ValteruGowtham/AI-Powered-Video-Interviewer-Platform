const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-mock-interviewer';
  
  // Skip connection if placeholder URI
  if (uri === 'YOUR_MONGODB_URI_HERE') {
    console.log('⚠️  MongoDB URI not configured. Skipping database connection.');
    console.log('   Set MONGODB_URI in .env to enable database features.\n');
    return;
  }
  
  try {
    await mongoose.connect(uri);
    console.log('✓ MongoDB connected successfully');
    console.log(`  Database: ${mongoose.connection.name}\n`);
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message);
    console.log('  Server will continue without database connection.\n');
  }
};

module.exports = connectDB;
