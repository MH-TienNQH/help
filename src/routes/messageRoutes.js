import { Router } from "express";
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";
import { addMessage } from "../controllers/messageController.js";

export const messageRoutes = Router();

messageRoutes.post("/add-message/:chatId", verifyTokenMiddlewares, addMessage);
