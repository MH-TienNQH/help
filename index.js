import dotenv from "dotenv";
dotenv.config();

//cron
import schedule from "node-schedule";

import express from "express";
import rootRouter from "./src/routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandlerMiddlewares } from "./src/middlewares/errorHandlerMiddlewares.js";
import { deleteNotVerified } from "./src/utils/deleteNotVerified.js";
import { deleteSoldProduct } from "./src/utils/deleteSoldProduct.js";

const PORT = process.env.PORT;

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api", rootRouter);
app.use(errorHandlerMiddlewares);

app.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "PUT, POST, GET, DELETE, PATCH, OPTIONS"
  );
});

schedule.scheduleJob("*/15 * * * *", deleteNotVerified);
schedule.scheduleJob("* * * * */7", deleteSoldProduct);

app.listen(PORT, () => `running on http://localhost:${PORT}`);
