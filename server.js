const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Routes = require('./routes/Routes');
const errorHandler = require('./utils/errorHandler');
const http = require('http');
const socketIo = require('socket.io'); 
dotenv.config(); 
const path = require('path');

const app = express();
app.use(cors({ origin: '*' }));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"]
  }
});
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log('Connected to MongoDB server'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());

app.use(express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.get('/', (req, res) => {
  res.send('Hello');
});
// API Routes
app.use('/api/', Routes);
// WebSocket event listeners
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send a welcome message when a user connects
  socket.emit('notification', { message: 'Welcome to the WebSocket server!' });

  // Listen for messages from the client
  socket.on('message', (data) => {
    console.log('Received message:', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Error handler
app.use(errorHandler);

// Start the server and listen on the specified port
const PORT = 3000;

server.listen(PORT, () => {
  console.log('Backend running on port', PORT);
  console.log(`Running URL: http://localhost:${PORT}`);
});
