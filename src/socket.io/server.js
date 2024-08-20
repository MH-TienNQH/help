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
  console.log("A user connected", socket.id);

  socket.on("notification", (data) => {
    console.log("Notification received:", data);
    io.emit("notification", data);
  });
  socket.on("login", (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
    console.log("Current userSockets map:", userSockets);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    userSockets.forEach((id, userId) => {
      if (id === socket.id) {
        userSockets.delete(userId);
        console.log(`User ${userId} removed from userSockets map`);
      }
    });
    console.log("Current userSockets map:", userSockets);
  });
});

export { socketServer, io };
