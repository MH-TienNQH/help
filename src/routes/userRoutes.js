import { Router } from "express";
import {
  addUser,
  deleteUser,
  getAllUser,
  getUserById,
  updateUser,
} from "../controllers/userControllers.js";
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";

export const userRoutes = Router();

userRoutes.get("/get-all", getAllUser);
userRoutes.get("/get-by-id/:id", getUserById);
userRoutes.post("/add-user", verifyTokenMiddlewares, addUser);
userRoutes.put("/update/:id", verifyTokenMiddlewares, updateUser);
userRoutes.delete("/delete/:id", verifyTokenMiddlewares, deleteUser);
