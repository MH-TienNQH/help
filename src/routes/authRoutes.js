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
  setPasswordSchema,
  signUpSchema,
} from "../schema/userSchema.js";
import { otpSchema } from "../schema/otpSchema.js";

import { upload } from "../utils/multer.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";
import { validationMiddlware } from "../middlewares/validationMiddlewares.js";

export const authRoutes = Router();

authRoutes.get("/refresh", refresh);
authRoutes.get("/verify/:email", verifyEmail);

authRoutes.post(
  "/signup",
  upload.fields([{ name: "avatar" }]),
  validationMiddlware(signUpSchema),
  uploadToCloudinary,
  signUp
);
authRoutes.post("/login", validationMiddlware(loginSchema), login);
authRoutes.post("/logout", verifyTokenMiddlewares, logout);
authRoutes.post(
  "/forgot-password",
  validationMiddlware(emailSchema),
  forgotPassword
);

authRoutes.put(
  "/set-password",
  validationMiddlware(setPasswordSchema),
  setPassword
);
