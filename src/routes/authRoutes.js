import { Router } from "express";
import {
  login,
  logout,
  refresh,
  signUp,
  verifyEmail,
} from "../controllers/authControllers.js";
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";
import { checkSchema } from "express-validator";
import { loginSchema, signUpSchema } from "../schema/userSchema.js";

export const authRoutes = Router();

authRoutes.post("/signup", checkSchema(signUpSchema), signUp);
authRoutes.post("/login", checkSchema(loginSchema), login);
authRoutes.post("/logout", logout);
authRoutes.get("/refresh", verifyTokenMiddlewares, refresh);
authRoutes.get("/verify/:email", verifyEmail);
