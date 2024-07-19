import { config } from "dotenv";
import { Server } from "socket.io";

config();

const io = new Server({
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

io.on("connection", (socket) => {
  console.log(socket);
});
