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

categoryRoutes.get("/get-all", getAllCategory);
categoryRoutes.get("/get-by-id/:id", getCategoryById);
categoryRoutes.post(
  "/add-category",
  verifyTokenMiddlewares,
  adminMiddlewares,
  validationMiddlware(categorySchema),
  addCategory
);
categoryRoutes.put(
  "/update/:id",
  verifyTokenMiddlewares,
  adminMiddlewares,
  validationMiddlware(categorySchema),
  verifyTokenMiddlewares,
  updateCategory
);
categoryRoutes.delete("/delete/:id", verifyTokenMiddlewares, deleteCategory);
