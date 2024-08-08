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

//authentication middlewares
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";

//validation
import { checkSchema } from "express-validator";
import { addProductSchema } from "../schema/productSchema.js";
import { uploadMiddleware } from "../utils/uploadFile.js";
import { upload } from "../utils/multer.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
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
  upload([
    { name: "cover", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  checkSchema(addProductSchema),
  verifyTokenMiddlewares,
  addProduct
);
productRoutes.put(
  "/update/:id",
  uploadMiddleware("cover", "images", 6),
  checkSchema(addProductSchema),
  verifyTokenMiddlewares,
  updateProduct
);
productRoutes.delete("/delete/:id", verifyTokenMiddlewares, deleteProduct);
