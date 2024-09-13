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
import checkVerifyStatusMiddleware from "../middlewares/checkVerifyStatusMiddleware.js";

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

// Public routes
productRoutes.get("/get-all", getAllProduct);
productRoutes.get("/newest", getNewestProduct);
productRoutes.get("/get-trending-products", getThreeTrendingProduct);
productRoutes.get("/list-product", listProduct);

// Routes that require token verification
productRoutes.use(verifyTokenMiddlewares);

productRoutes.get("/get-by-id/:id", getProductById);
productRoutes.get("/count-product", countProducts);

productRoutes.post(
  "/add-product",
  upload.fields([{ name: "images" }]),
  checkVerifyStatusMiddleware,
  validationMiddlware(addProductSchema),
  uploadToCloudinary,
  addProduct
);

productRoutes.put(
  "/update/:id",
  upload.fields([{ name: "images" }]),
  validationMiddlware(updateProductSchema),
  uploadToCloudinary,
  updateProduct
);

productRoutes.delete("/delete/:id", deleteProduct);

// Routes that require both token verification and admin privileges
productRoutes.use(adminMiddlewares);

productRoutes.put("/approve/:id", approveProduct);
productRoutes.put(
  "/reject/:id",
  validationMiddlware(messageSchema),
  rejectProduct
);
