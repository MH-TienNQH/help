import { Router } from "express";

//controllers
import {
  addCategory,
  deleteCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
} from "../controllers/categoryController.js";

//authentication middlewares
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";
import adminMiddlewares from "../middlewares/adminMiddlewares.js";

//validation
import { checkSchema } from "express-validator";
import { addCategorySchema } from "../schema/categorySchema.js";

export const categoryRoutes = Router();

categoryRoutes.get("/get-all", getAllCategory);
categoryRoutes.get("/get-by-id/:id", getCategoryById);
categoryRoutes.post(
  "/add-category",
  verifyTokenMiddlewares,
  adminMiddlewares,
  checkSchema(addCategorySchema),
  addCategory
);
categoryRoutes.put(
  "/update/:id",
  checkSchema(addCategorySchema),
  verifyTokenMiddlewares,
  updateCategory
);
categoryRoutes.delete("/delete/:id", verifyTokenMiddlewares, deleteCategory);
