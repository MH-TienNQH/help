import http from "http";
import { Server as SocketIO } from "socket.io";
import cors from "cors";

// Create an HTTP server for Socket.IO
const socketServer = http.createServer();

// Initialize Socket.IO server
const io = new SocketIO(socketServer, {
  cors: {
    origin: "*",
  },
});

export const userSockets = new Map();

// Socket.IO connection handling
io.on("connection", (socket) => {
  socket.on("login", (userId) => {
    userSockets.set(userId, socket.id);
  });

  socket.on("like", (data) => {
    io.emit("like", data);
  });

  socket.on("buyRequest", (data) => {
    io.emit("buyRequest", data);
  });

  socket.on("comment", (data) => {
    io.emit("comment", data);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    userSockets.forEach((id, userId) => {
      if (id === socket.id) {
        userSockets.delete(userId);
      }
    });
  });
});

export { socketServer, io };
