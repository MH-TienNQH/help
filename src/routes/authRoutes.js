import { Router } from "express";
import {
  login,
  logout,
  refresh,
  signUp,
  forgotPassword,
  verifyEmail,
  setPassword,
} from "../controllers/authControllers.js";
import { checkSchema } from "express-validator";
import {
  emailSchema,
  loginSchema,
  passwordSchema,
  signUpSchema,
} from "../schema/userSchema.js";
import { otpSchema } from "../schema/otpSchema.js";
import { upload } from "../utils/uploadFile.js";

export const authRoutes = Router();

authRoutes.post(
  "/signup",
  upload.single("avatar"),
  checkSchema(signUpSchema),
  signUp
);
authRoutes.post("/login", checkSchema(loginSchema), login);
authRoutes.post("/logout", logout);
authRoutes.get("/refresh", refresh);
authRoutes.get("/verify/:email", verifyEmail);
authRoutes.get(
  "/set-password",
  checkSchema(emailSchema),
  checkSchema(passwordSchema),
  checkSchema(otpSchema),
  setPassword
);
authRoutes.get("/forgot-password", checkSchema(emailSchema), forgotPassword);
