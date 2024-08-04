import { Router } from "express";

//controllers
import {
  addProduct,
  deleteProduct,
  getAllProduct,
  getNewestProduct,
  getProductById,
  getSellingProduct,
  getSoldProduct,
  getThreeTrendingProduct,
  listProduct,
  updateProduct,
  verifyProduct,
} from "../controllers/productController.js";

//upload file
import { uploadMiddleware } from "../utils/uploadFile.js";

//authentication middlewares
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";

//validation
import { checkSchema } from "express-validator";
import { addProductSchema } from "../schema/productSchema.js";
import adminMiddlewares from "../middlewares/adminMiddlewares.js";
export const productRoutes = Router();

productRoutes.get("/get-all", getAllProduct);
productRoutes.get("/get-by-id/:id", verifyTokenMiddlewares, getProductById);
productRoutes.get("/selling-products", getSellingProduct);
productRoutes.get("/sold-products", getSoldProduct);
productRoutes.get("/newest", getNewestProduct);
productRoutes.get("/get-trending-products", getThreeTrendingProduct);
productRoutes.get("/list-product", listProduct);
productRoutes.post(
  "/add-product",
  uploadMiddleware.single("image"),
  checkSchema(addProductSchema),
  verifyTokenMiddlewares,
  addProduct
);
productRoutes.put(
  "/update/:id",
  uploadMiddleware.single("image"),
  checkSchema(addProductSchema),
  verifyTokenMiddlewares,
  updateProduct
);
productRoutes.put(
  "/verify-product/:id",
  verifyTokenMiddlewares,
  adminMiddlewares,
  verifyProduct
);
productRoutes.delete("/delete/:id", verifyTokenMiddlewares, deleteProduct);
