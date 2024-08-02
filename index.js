import dotenv from "dotenv";
dotenv.config();

//cron
import schedule from "node-schedule";

import express from "express";
import rootRouter from "./src/routes/index.js";
import cookieParser from "cookie-parser";
import { errorHandlerMiddlewares } from "./src/middlewares/errorHandlerMiddlewares.js";
import { deleteNotVerified } from "./src/utils/deleteNotVerified.js";
import { expireOTP } from "./src/utils/expireOTP.js";
import bodyParser from "body-parser";

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api", rootRouter);
app.use(errorHandlerMiddlewares);

schedule.scheduleJob("*/10 * * * *", deleteNotVerified);
schedule.scheduleJob("*/1 * * * *", expireOTP);

app.listen(PORT, () => `running on http://localhost:${PORT}`);
