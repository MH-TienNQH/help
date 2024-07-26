import { Router } from "express";

//controllers
import {
  addProduct,
  deleteProduct,
  getAllProduct,
  getProductById,
  getThreeTrendingProduct,
  updateProduct,
} from "../controllers/productController.js";

//authentication middlewares
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";

//validation
import { checkSchema } from "express-validator";
import { addProductSchema } from "../schema/productSchema.js";

export const productRoutes = Router();

productRoutes.get("/get-all", getAllProduct);
productRoutes.get("/get-by-id/:id", getProductById);
productRoutes.get("/get-trending-products", getThreeTrendingProduct);
productRoutes.post(
  "/add-product",
  checkSchema(addProductSchema),
  verifyTokenMiddlewares,
  addProduct
);
productRoutes.put(
  "/update/:id",
  checkSchema(addProductSchema),
  verifyTokenMiddlewares,
  updateProduct
);
productRoutes.delete("/delete/:id", verifyTokenMiddlewares, deleteProduct);
