const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || typeof uri !== 'string') {
    console.error(
      'MongoDB connection error: MONGODB_URI is not set.\n' +
      'Create backend/.env (copy from .env.example) and set MONGODB_URI=mongodb://localhost:27017/webapp'
    );
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
