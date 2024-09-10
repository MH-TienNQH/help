import { Router } from "express";
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";
import {
  addComment,
  deleteComment,
  getComments,
  updateComment,
} from "../controllers/commentController.js";
import checkVerifyStatusMiddleware from "../middlewares/checkVerifyStatusMiddleware.js";

export const commentRoutes = Router();

commentRoutes.get("/get-comments/:id", getComments);

// Routes that require token verification
commentRoutes.use(verifyTokenMiddlewares);

commentRoutes.put("/update/:id", updateComment);
commentRoutes.delete("/delete/:id", deleteComment);

// Route that requires both token verification and checkVerifyStatusMiddleware
commentRoutes.post("/add-comment/:id", checkVerifyStatusMiddleware, addComment);
