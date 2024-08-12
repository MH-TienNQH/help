import { Router } from "express";

//controllers
import {
  addProduct,
  approveProduct,
  deleteProduct,
  getAllProduct,
  getNewestProduct,
  getProductById,
  getSellingProduct,
  getSoldProduct,
  getThreeTrendingProduct,
  listProduct,
  rejectProduct,
  updateProduct,
} from "../controllers/productController.js";

//upload file

//authentication middlewares
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";

//validation
import { checkSchema } from "express-validator";
import { addProductSchema } from "../schema/productSchema.js";
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
  upload.fields([{ name: "images", maxCount: 6 }]),
  uploadToCloudinary,
  checkSchema(addProductSchema),
  verifyTokenMiddlewares,
  addProduct
);
productRoutes.put(
  "/update/:id",
  upload.fields([{ name: "images", maxCount: 6 }]),
  checkSchema(addProductSchema),
  verifyTokenMiddlewares,
  updateProduct
);
productRoutes.put(
  "/approve/:id",
  verifyTokenMiddlewares,
  adminMiddlewares,
  approveProduct
);

productRoutes.put(
  "/reject/:id",
  verifyTokenMiddlewares,
  adminMiddlewares,
  rejectProduct
);

productRoutes.delete("/delete/:id", verifyTokenMiddlewares, deleteProduct);
