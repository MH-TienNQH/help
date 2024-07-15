import { Router } from "express";
import {
  addUser,
  deleteUser,
  getAllUser,
  getUserById,
  updateUser,
} from "../controllers/userControllers.js";

export const userRoutes = Router();

userRoutes.get("/get-all", getAllUser);
userRoutes.get("/get-by-id/:id", getUserById);
userRoutes.post("/add-user", addUser);
userRoutes.put("/update/:id", updateUser);
userRoutes.delete("/delete/:id", deleteUser);
