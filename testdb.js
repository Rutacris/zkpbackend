require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

testConnection();