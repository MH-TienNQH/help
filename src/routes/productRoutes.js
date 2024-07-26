import { Router } from "express";

//controllers
import {
  addProduct,
  deleteProduct,
  getAllProduct,
  getNewestProduct,
  getProductById,
<<<<<<< HEAD
  getSellingProduct,
  getSoldProduct,
  getThreeTrendingProduct,
=======
>>>>>>> d25b09119b0ded7a06e8f946e0e333cf6f5bd055
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
<<<<<<< HEAD
productRoutes.get("/get-trending-products", getThreeTrendingProduct);
productRoutes.get("/selling-products", getSellingProduct);
productRoutes.get("/sold-products", getSoldProduct);
productRoutes.get("/newest", getNewestProduct);
=======
>>>>>>> d25b09119b0ded7a06e8f946e0e333cf6f5bd055
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
