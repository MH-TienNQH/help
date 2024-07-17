import { Router } from "express";
import {
  login,
  logout,
  refresh,
  signUp,
} from "../controllers/authControllers.js";
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";
import { checkSchema } from "express-validator";
import { signUpSchema } from "../schema/userSchema.js";

export const authRoutes = Router();

authRoutes.post("/signup", checkSchema(signUpSchema), signUp);
authRoutes.post("/login", login, verifyTokenMiddlewares);
authRoutes.post("/logout", logout);
authRoutes.post("/refresh-token", refresh);
