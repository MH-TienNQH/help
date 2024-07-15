import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authRoutes } from "./authRoutes.js";
import { userRoutes } from "./userRoutes.js";

const rootRouter = Router();

export const prismaClient = new PrismaClient({
  log: ["query"],
});

rootRouter.use("/auth", authRoutes);
rootRouter.use("/user", userRoutes);

export default rootRouter;
