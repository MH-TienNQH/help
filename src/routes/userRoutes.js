import { Router } from "express";
import {
  addUser,
  deleteUser,
  getAllUser,
  getUserById,
  personalProduct,
  saveProduct,
  updateUser,
} from "../controllers/userControllers.js";
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";
import { checkSchema } from "express-validator";
import { signUpSchema } from "../schema/userSchema.js";

export const userRoutes = Router();

userRoutes.get("/get-all", verifyTokenMiddlewares, getAllUser);
userRoutes.get("/get-by-id/:id", verifyTokenMiddlewares, getUserById);
userRoutes.post(
  "/add-user",
  checkSchema(signUpSchema),
  verifyTokenMiddlewares,
  addUser
);
userRoutes.put(
  "/update/:id",
  checkSchema(signUpSchema),
  verifyTokenMiddlewares,
  updateUser
);
userRoutes.delete("/delete/:id", verifyTokenMiddlewares, deleteUser);
userRoutes.post("/save-product", verifyTokenMiddlewares, saveProduct);
userRoutes.get("/personal-product", verifyTokenMiddlewares, personalProduct);
