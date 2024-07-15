import { Router } from "express";
import {
  addCategory,
  deleteCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
} from "../controllers/categoryController.js";

export const categoryRoutes = Router();

categoryRoutes.get("/get-all", getAllCategory);
categoryRoutes.get("/get-by-id/:id", getCategoryById);
categoryRoutes.post("/add-category", addCategory);
categoryRoutes.put("/update/:id", updateCategory);
categoryRoutes.delete("/delete/:id", deleteCategory);
