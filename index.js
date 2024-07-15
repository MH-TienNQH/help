import express from "express";
import dotenv from "dotenv";
import rootRouter from "./src/routes/index.js";

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(express.json());

app.use("/api", rootRouter);

app.get("/", (req, res) => {
  res.send("hey");
});

app.listen(PORT, () => `running on http://localhost:${PORT}`);
