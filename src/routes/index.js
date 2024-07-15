import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authRoutes } from "./authRoutes.js";

const rootRouter = Router();

export const prismaClient = new PrismaClient({
  log: ["query"],
});

rootRouter.use("/auth", authRoutes);

export default rootRouter;
