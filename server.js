const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Routes = require('./routes/Routes');
const errorHandler = require('./utils/errorHandler');
dotenv.config();  // Load environment variables
const app = express();

// Use the appropriate URI
const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log('Connected to MongoDB server'))
  .catch(err => console.error('MongoDB connection error:', err));

  
app.use(express.json());  

app.use('/api/', Routes);

app.use(errorHandler);

const PORT = 3000;

app.listen(PORT, () => {
  console.log('Backend running on port', PORT);
  console.log(`Running URL: http://localhost:${PORT}`);
});
