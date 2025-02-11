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
const { exec } = require("child_process");
const path = require('path');
const bodyParser = require('body-parser');

dotenv.config(); // Load environment variables

const app = express();
app.use(cors({ origin: '*' }));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;
mongoose
  .connect(mongoURI)
  .then(() => console.log('Connected to MongoDB server'))
  .catch(err => console.error('MongoDB connection error:', err));
  
// Serve Static Files
app.use(express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Basic Route
app.get('/', (req, res) => {
  res.send('Hello, the backend is running!');
});

// API Routes
app.use('/api/', Routes);

// WebSocket Connection
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

// GitHub Webhook for Auto Deployment
app.post("/webhook", (req, res) => {
    const payload = req.body;
    
    if (payload.ref === "refs/heads/main") {  // Adjust branch if needed
        console.log("New commit detected. Pulling changes...");

        exec("cd /parampara_admin && git pull && npm install && pm2 restart app", (err, stdout, stderr) => {
            if (err) {
                console.error(`Error: ${err.message}`);
                return res.status(500).send("Error updating project");
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
            res.status(200).send("Updated successfully");
        });
    } else {
        res.status(200).send("No update needed");
    }
});

// Error handler middleware
app.use(errorHandler);

// Start the Server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Running URL: http://localhost:${PORT}`);
});
