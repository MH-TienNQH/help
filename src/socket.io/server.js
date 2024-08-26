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
    io.emit("like", data);
  });

  socket.on("buyRequest", (data) => {
    io.emit("buyRequest", data);
  });

  socket.on("comment", (data) => {
    io.to(data.ownerSocketId).emit("comment", data);
  });

  socket.on("productAdded", (data) => {
    io.emit("productAdded", data);
    console.log(`A product have been added by ${data.user.name}`, data);
  });

  socket.on("productApproved", (data) => {
    io.emit("productApproved", data);
  });
  socket.on("productRejected", (data) => {
    io.emit("productRejected", data);
  });

  socket.on("approveBuyReq", (data) => {
    io.emit("approveBuyReq", data);
  });

  socket.on("rejectBuyReq", (data) => {
    io.emit("rejectBuyReq", data);
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
