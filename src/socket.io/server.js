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
export const adminSockets = new Map();
export const emitToAdmins = (event, data) => {
  adminSockets.forEach((socketId) => {
    io.to(socketId).emit(event, data);
  });
};

// Socket.IO connection handling
io.on("connection", (socket) => {
  socket.on("login", (userId, role) => {
    userSockets.set(userId, socket.id);
    if (role == "ADMIN") {
      adminSockets.set(userId, socket.id);
    }
    console.log(adminSockets);
  });

  socket.on("like", (data) => {
    io.to(data.ownerSocketId).emit("like", data);
  });

  socket.on("buyRequest", (data) => {
    io.to(data.ownerSocketId).emit("buyRequest", data);
  });

  socket.on("comment", (data) => {
    io.to(data.ownerSocketId).emit("comment", data);
  });

  socket.on("productAdded", (data) => {
    emitToAdmins("productAdded", data);
    console.log(`A product have been added by ${data.user.name}`, data);
  });

  socket.on("productApproved", (data) => {
    io.to(data.ownerSocketId).emit("productApproved", data);
  });
  socket.on("productRejected", (data) => {
    io.to(data.ownerSocketId).emit("productRejected", data);
  });

  socket.on("approveBuyReq", (data) => {
    io.to(data.buyer).emit("approveBuyReq", data);
  });

  socket.on("rejectBuyReq", (data) => {
    io.to(data.buyer).emit("rejectBuyReq", data);
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
