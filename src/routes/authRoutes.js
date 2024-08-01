import { Router } from "express";
import {
  login,
  logout,
  refresh,
  signUp,
  forgotPassword,
  verifyEmail,
  sendOTP,
} from "../controllers/authControllers.js";
import { checkSchema } from "express-validator";
import {
  emailSchema,
  loginSchema,
  passwordSchema,
  signUpSchema,
} from "../schema/userSchema.js";

export const authRoutes = Router();

authRoutes.post("/signup", checkSchema(signUpSchema), signUp);
authRoutes.post("/login", checkSchema(loginSchema), login);
authRoutes.post("/logout", logout);
authRoutes.get("/refresh", refresh);
authRoutes.get("/verify/:email", verifyEmail);
authRoutes.get(
  "/forgot-password",
  checkSchema(emailSchema),
  checkSchema(passwordSchema),
  forgotPassword
);
authRoutes.get("/send-otp", sendOTP);
