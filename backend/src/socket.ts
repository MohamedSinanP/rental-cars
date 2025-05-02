// src/socket.ts
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

let io: SocketIOServer;

export const initSocket = (server: http.Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('joinRoom', ({ roomId }) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on('userLocationUpdate', ({ userId, latitude, longitude }) => {
      console.log(` Location from ${userId}:`, latitude, longitude);

      io.to(userId).emit('locationUpdateFromUser', {
        userId,
        latitude,
        longitude,
      });
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

export const getIO = () => io;
