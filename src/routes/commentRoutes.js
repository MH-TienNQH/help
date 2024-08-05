import { Router } from "express";
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";
import {
  deleteComment,
  updateComment,
} from "../controllers/commentController.js";

export const commentRoutes = Router();

commentRoutes.put("/update/:id", verifyTokenMiddlewares, updateComment);
commentRoutes.delete("/delete/:id", verifyTokenMiddlewares, deleteComment);
