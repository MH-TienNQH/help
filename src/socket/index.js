import { config } from "dotenv";
import { Server } from "socket.io";

config();

const io = new Server({
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

io.on("", (socket) => {
  console.log(socket);
});

io.listen();
