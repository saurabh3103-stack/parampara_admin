const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;  // MongoDB URI from .env

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);  // Exit process with failure
  }
};

module.exports = connectDB;
