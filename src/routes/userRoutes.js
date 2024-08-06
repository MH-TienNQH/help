import { Router } from "express";

//controllers
import {
  addUser,
  deleteUser,
  getAllUser,
  getUserById,
  likeProduct,
  personalProduct,
  saveProduct,
  updateUser,
} from "../controllers/userControllers.js";

//authentication middlewares
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";
import adminMiddlewares from "../middlewares/adminMiddlewares.js";

//validation
import { checkSchema } from "express-validator";
import { signUpSchema } from "../schema/userSchema.js";
import { uploadMiddleware } from "../utils/uploadFile.js";

//upload file

export const userRoutes = Router();

userRoutes.get("/get-all", verifyTokenMiddlewares, getAllUser);
userRoutes.get("/get-by-id/:id", verifyTokenMiddlewares, getUserById);
userRoutes.post(
  "/add-user",
  uploadMiddleware.single("avatar"),
  checkSchema(signUpSchema),
  verifyTokenMiddlewares,
  adminMiddlewares,
  addUser
);
userRoutes.put(
  "/update/:id",
  uploadMiddleware.single("avatar"),
  checkSchema(signUpSchema),
  verifyTokenMiddlewares,
  updateUser
);
userRoutes.delete(
  "/delete/:id",
  verifyTokenMiddlewares,
  adminMiddlewares,
  deleteUser
);
userRoutes.post("/save-product/:id", verifyTokenMiddlewares, saveProduct);
userRoutes.get(
  "/personal-product/:id",
  verifyTokenMiddlewares,
  personalProduct
);
userRoutes.post("/like-product/:id", verifyTokenMiddlewares, likeProduct);
