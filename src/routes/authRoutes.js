import { Router } from "express";
import { login, signUp } from "../controllers/authControllers.js";

export const authRoutes = Router();

authRoutes.post("/signup", signUp);
authRoutes.post("/login", login);
