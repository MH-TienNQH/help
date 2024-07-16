import { Router } from "express";
import {
  addCategory,
  deleteCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
} from "../controllers/categoryController.js";
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";

export const categoryRoutes = Router();

categoryRoutes.get("/get-all", getAllCategory);
categoryRoutes.get("/get-by-id/:id", getCategoryById);
categoryRoutes.post("/add-category", verifyTokenMiddlewares, addCategory);
categoryRoutes.put("/update/:id", verifyTokenMiddlewares, updateCategory);
categoryRoutes.delete("/delete/:id", verifyTokenMiddlewares, deleteCategory);
