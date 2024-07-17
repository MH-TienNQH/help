import express from "express";
import dotenv from "dotenv";
import rootRouter from "./src/routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandlerMiddlewares } from "./src/middlewares/errorHandlerMiddlewares.js";

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(errorHandlerMiddlewares);

app.use("/api", rootRouter);

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
app.listen(PORT, () => `running on http://localhost:${PORT}`);
