import http from "http";
import { Server as SocketIO } from "socket.io";
import { prismaClient } from "../routes/index.js";

// Create an HTTP server for Socket.IO
const socketServer = http.createServer();

// Initialize Socket.IO server
const io = new SocketIO(socketServer, {
  cors: {
    origin: "*",
  },
});

export const adminSockets = new Set();
// Socket.IO connection handling
io.on("connection", (socket) => {
  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on("login", (userId) => {
    // Check if the user is an admin from the database
    prismaClient.user
      .findUnique({
        where: { userId },
      })
      .then((user) => {
        if (user && user.role === "ADMIN") {
          adminSockets.add(socket.id);
          console.log(`Admin ${userId} connected with socket ${socket.id}`);
        }
      });
  });

  socket.on("disconnect", () => {});
});

const SOCKET_PORT = process.env.SOCKET_PORT || 3000;
socketServer.listen(SOCKET_PORT, () => {
  console.log(`Socket.IO server is running on http://localhost:${SOCKET_PORT}`);
});

export { socketServer, io };
