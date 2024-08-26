import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
// //cron
import schedule from "node-schedule";

import express from "express";
import rootRouter from "./src/routes/index.js";
import cookieParser from "cookie-parser";
import { socketServer, userSockets } from "./src/socket.io/server.js";

//midlleware
import { errorHandlerMiddlewares } from "./src/middlewares/errorHandlerMiddlewares.js";
import paginationMiddleware from "./src/middlewares/paginationMiddleware.js";
import bodyParser from "body-parser";
import { deleteNotVerified } from "./src/utils/deleteNotVerified.js";
import uploadToCloudinary from "./src/utils/uploadToCloudinary.js";
import { io } from "socket.io-client";

const PORT = process.env.PORT;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(paginationMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(uploadToCloudinary);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use("/api", rootRouter);
app.use(errorHandlerMiddlewares);

schedule.scheduleJob("*/10 * * * *", deleteNotVerified);

const SOCKET_PORT = process.env.SOCKET_PORT || 3000;
export const socket = io(`http://localhost:${SOCKET_PORT}`);
socketServer.listen(SOCKET_PORT, () => {
  console.log(`Socket.IO server is running on http://localhost:${SOCKET_PORT}`);
});
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
