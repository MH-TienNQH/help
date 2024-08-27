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
  socket.on("joinRoom", async (productId, userId) => {
    // Optionally check if the user is the owner of the product
    const product = await prismaClient.product.findUnique({
      where: { productId },
      select: { userId: true },
    });

    if (product && product.userId === userId) {
      socket.join(`product-${productId}`);
      console.log(`User ${userId} joined room product-${productId}`);
    }
  });

  socket.on("login", async (userId) => {
    // Check if the user is an admin from the database
    const user = await prismaClient.user.findUnique({ where: { userId } });
    if (user) {
      if (user.role === "ADMIN") {
        adminSockets.add(socket.id);
        console.log(`Admin ${userId} connected with socket ${socket.id}`);
      }

      // Example of automatic room joining for owned products
      const products = await prismaClient.product.findMany({
        where: { userId },
      });

      products.forEach((product) => {
        socket.join(`product-${product.productId}`);
        console.log(`User ${userId} joined room product-${product.productId}`);
      });
    }
  });

  socket.on("disconnect", () => {});
});

const SOCKET_PORT = process.env.SOCKET_PORT || 3000;
socketServer.listen(SOCKET_PORT, () => {
  console.log(`Socket.IO server is running on http://localhost:${SOCKET_PORT}`);
});

export { socketServer, io };
