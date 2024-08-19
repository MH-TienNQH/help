import { Router } from "express";

//controllers
import {
  addProduct,
  approveProduct,
  countProducts,
  deleteProduct,
  getAllProduct,
  getNewestProduct,
  getProductById,
  getThreeTrendingProduct,
  listProduct,
  rejectProduct,
  updateProduct,
} from "../controllers/productController.js";

//upload file

//authentication middlewares
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";

//validation
import { upload } from "../utils/multer.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import adminMiddlewares from "../middlewares/adminMiddlewares.js";
import { validationMiddlware } from "../middlewares/validationMiddlewares.js";
import { messageSchema } from "../schema/requestSchema.js";
import {
  addProductSchema,
  updateProductSchema,
} from "../schema/productSchema.js";
export const productRoutes = Router();

productRoutes.get("/get-all", getAllProduct);
productRoutes.get("/get-by-id/:id", verifyTokenMiddlewares, getProductById);
productRoutes.get("/newest", getNewestProduct);
productRoutes.get("/get-trending-products", getThreeTrendingProduct);
productRoutes.get("/list-product", listProduct);
productRoutes.get("/count-product", verifyTokenMiddlewares, countProducts);
productRoutes.post(
  "/add-product",
  upload.fields([{ name: "images" }]),
  verifyTokenMiddlewares,
  validationMiddlware(addProductSchema),
  uploadToCloudinary,
  addProduct
);
productRoutes.put(
  "/update/:id",
  upload.fields([{ name: "images" }]),
  verifyTokenMiddlewares,
  validationMiddlware(updateProductSchema),
  uploadToCloudinary,
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
  validationMiddlware(messageSchema),
  verifyTokenMiddlewares,
  adminMiddlewares,
  rejectProduct
);

productRoutes.delete("/delete/:id", verifyTokenMiddlewares, deleteProduct);
