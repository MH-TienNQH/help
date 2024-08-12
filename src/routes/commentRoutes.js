import { Router } from "express";
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";
import {
  addComment,
  deleteComment,
  getComments,
  updateComment,
} from "../controllers/commentController.js";

export const commentRoutes = Router();

commentRoutes.put("/update/:id", verifyTokenMiddlewares, updateComment);
commentRoutes.delete("/delete/:id", verifyTokenMiddlewares, deleteComment);
commentRoutes.get("/get-comments", getComments);
commentRoutes.post("/add-comment/:id", verifyTokenMiddlewares, addComment);
