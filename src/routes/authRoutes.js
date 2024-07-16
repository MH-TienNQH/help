import { Router } from "express";
import { login, logout, signUp } from "../controllers/authControllers.js";
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";

export const authRoutes = Router();

authRoutes.post("/signup", signUp);
authRoutes.post("/login", login, verifyTokenMiddlewares);
authRoutes.post("/logout", logout);
