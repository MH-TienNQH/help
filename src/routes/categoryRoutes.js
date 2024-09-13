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
import { categorySchema } from "../schema/categorySchema.js";
import { validationMiddlware } from "../middlewares/validationMiddlewares.js";

export const categoryRoutes = Router();

// Public routes
categoryRoutes.get("/get-all", getAllCategory);
categoryRoutes.get("/get-by-id/:id", getCategoryById);

categoryRoutes.use(verifyTokenMiddlewares);

// Admin routes
categoryRoutes.use(adminMiddlewares);
categoryRoutes.post(
  "/add-category",
  validationMiddlware(categorySchema),
  addCategory
);

categoryRoutes.put(
  "/update/:id",
  validationMiddlware(categorySchema),
  updateCategory
);

categoryRoutes.delete("/delete/:id", deleteCategory);
