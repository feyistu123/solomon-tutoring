const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Replace with your local MongoDB URI or MongoDB Atlas cloud URI
    const mongoURI = process.env.MONGODB_URI;
    
    await mongoose.connect(mongoURI);
    console.log('🚀 Successfully connected to MongoDB!');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1); // Stop the app if we can't connect
  }
};

module.exports = connectDB;