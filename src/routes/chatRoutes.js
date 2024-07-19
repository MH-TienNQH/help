import { Router } from "express";
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";
import {
  addChat,
  getAllChats,
  getChatById,
} from "../controllers/chatController.js";

export const chatRoutes = Router();

chatRoutes.get("/get-all", verifyTokenMiddlewares, getAllChats);
chatRoutes.get("/:id", verifyTokenMiddlewares, getChatById);
chatRoutes.post("/add-chat", verifyTokenMiddlewares, addChat);
