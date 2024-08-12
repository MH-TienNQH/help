import { Router } from "express";

//controllers
import {
  addUser,
  approveRequest,
  deleteUser,
  getAllUser,
  getUserById,
  likeProduct,
  personalProduct,
  rejectRequest,
  requestToBuy,
  saveProduct,
  updateUser,
} from "../controllers/userControllers.js";

//authentication middlewares
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";
import adminMiddlewares from "../middlewares/adminMiddlewares.js";

//validation
import { checkSchema } from "express-validator";
import { signUpSchema } from "../schema/userSchema.js";

import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import { upload } from "../utils/multer.js";

export const userRoutes = Router();

userRoutes.get("/get-all", verifyTokenMiddlewares, getAllUser);
userRoutes.get("/get-by-id/:id", verifyTokenMiddlewares, getUserById);
userRoutes.post(
  "/add-user",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  uploadToCloudinary,
  checkSchema(signUpSchema),
  verifyTokenMiddlewares,
  adminMiddlewares,
  addUser
);
userRoutes.put(
  "/update/:id",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  uploadToCloudinary,
  checkSchema(signUpSchema),
  verifyTokenMiddlewares,
  updateUser
);
userRoutes.put(
  "/approve-request/:productId/:userId",
  verifyTokenMiddlewares,
  approveRequest
);

userRoutes.put(
  "/reject-request/:productId/:userId",
  verifyTokenMiddlewares,
  rejectRequest
);

userRoutes.delete(
  "/delete/:id",
  verifyTokenMiddlewares,
  adminMiddlewares,
  deleteUser
);
userRoutes.post("/save-product/:id", verifyTokenMiddlewares, saveProduct);
userRoutes.get("/personal-product", verifyTokenMiddlewares, personalProduct);
userRoutes.post("/like-product/:id", verifyTokenMiddlewares, likeProduct);
userRoutes.post("/request-to-buy/:id", verifyTokenMiddlewares, requestToBuy);
