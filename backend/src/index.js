import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './db/index.js'; // Adjust path as needed
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });
// Apply CORS middleware
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }));
  

// MongoDB connection
connectDB({ path: './env' }); // Ensure this connects to your MongoDB instance

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined`);
  });

  socket.on('offer', ({ offer, target }) => {
    io.to(target).emit('offer', { offer });
  });

  socket.on('answer', ({ answer, target }) => {
    io.to(target).emit('answer', { answer });
  });

  socket.on('candidate', ({ candidate, target }) => {
    io.to(target).emit('candidate', { candidate });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

