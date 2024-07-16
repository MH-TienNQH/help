import express from "express";
import dotenv from "dotenv";
import rootRouter from "./src/routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api", rootRouter);

app.get("/", (req, res) => {
  res.send("hey");
});

app.listen(PORT, () => `running on http://localhost:${PORT}`);
