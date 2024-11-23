const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Routes = require('./routes/Routes');
const errorHandler = require('./utils/errorHandler');
dotenv.config();  // Load environment variables
const path = require('path');

const app = express();
app.use(cors({ origin: '*' }));

// Use the appropriate URI
const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log('Connected to MongoDB server'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware to parse JSON bodies
app.use(express.json());

// Static files (images)
app.use(express.static(path.join(__dirname, 'uploads')));

// Default route
app.get('/', (req, res) => {
  res.send('Hello');
});

// API Routes
app.use('/api/', Routes);

// Error handler
app.use(errorHandler);

const PORT = 3000;

app.listen(PORT, () => {
  console.log('Backend running on port', PORT);
  console.log(`Running URL: http://localhost:${PORT}`);
});
