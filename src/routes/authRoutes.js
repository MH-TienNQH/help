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
import {
  emailSchema,
  loginSchema,
  passwordSchema,
  signUpSchema,
} from "../schema/userSchema.js";
import { otpSchema } from "../schema/otpSchema.js";

import { upload } from "../utils/multer.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";
import {
  validateSignUpSchema,
  validationMiddlware,
} from "../middlewares/validationMiddlewares.js";

export const authRoutes = Router();

authRoutes.post(
  "/signup",
  upload.fields([{ name: "avatar" }]),
  validateSignUpSchema(),
  uploadToCloudinary,
  signUp
);
authRoutes.post("/login", validationMiddlware(loginSchema), login);
authRoutes.post("/logout", verifyTokenMiddlewares, logout);
authRoutes.get("/refresh", refresh);
authRoutes.get("/verify/:email", verifyEmail);
authRoutes.put(
  "/set-password",
  validationMiddlware(emailSchema),
  validationMiddlware(passwordSchema),
  validationMiddlware(otpSchema),
  setPassword
);
authRoutes.post(
  "/forgot-password",
  validationMiddlware(emailSchema),
  forgotPassword
);
