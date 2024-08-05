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
} from "../controllers/productController.js";

//upload file
import { uploadMiddleware } from "../utils/uploadFile.js";

//authentication middlewares
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";

//validation
import { checkSchema } from "express-validator";
import { addProductSchema } from "../schema/productSchema.js";
import { addComment, getComments } from "../controllers/commentController.js";
export const productRoutes = Router();

productRoutes.get("/get-all", getAllProduct);
productRoutes.get("/get-by-id/:id", verifyTokenMiddlewares, getProductById);
productRoutes.get("/selling-products", getSellingProduct);
productRoutes.get("/sold-products", getSoldProduct);
productRoutes.get("/newest", getNewestProduct);
productRoutes.get("/get-trending-products", getThreeTrendingProduct);
productRoutes.get("/list-product", listProduct);
productRoutes.get("/get-comments", getComments);

productRoutes.post(
  "/add-product",
  uploadMiddleware.single("image"),
  checkSchema(addProductSchema),
  verifyTokenMiddlewares,
  addProduct
);
productRoutes.post("/add-comment/:id", verifyTokenMiddlewares, addComment);

productRoutes.put(
  "/update/:id",
  uploadMiddleware.single("image"),
  checkSchema(addProductSchema),
  verifyTokenMiddlewares,
  updateProduct
);
productRoutes.delete("/delete/:id", verifyTokenMiddlewares, deleteProduct);
