import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
// //cron
import schedule from "node-schedule";

import express from "express";
import rootRouter from "./src/routes/index.js";
import cookieParser from "cookie-parser";

//midlleware
import { errorHandlerMiddlewares } from "./src/middlewares/errorHandlerMiddlewares.js";
import paginationMiddleware from "./src/middlewares/paginationMiddleware.js";
import bodyParser from "body-parser";
import { deleteNotVerified } from "./src/utils/deleteNotVerified.js";

const PORT = process.env.PORT;

const app = express();
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(paginationMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use("/api", rootRouter);
app.use(errorHandlerMiddlewares);

schedule.scheduleJob("*/10 * * * *", deleteNotVerified);

app.listen(PORT, () => `running on http://localhost:${PORT}`);
