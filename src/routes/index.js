import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { authRoutes } from "./authRoutes.js";
import { userRoutes } from "./userRoutes.js";
import { productRoutes } from "./productRoutes.js";
import { categoryRoutes } from "./categoryRoutes.js";

const rootRouter = Router();

export const prismaClient = new PrismaClient({
  log: ["query"],
});

rootRouter.use("/auth", authRoutes);
rootRouter.use("/user", userRoutes);
rootRouter.use("/product", productRoutes);
rootRouter.use("/category", categoryRoutes);

export default rootRouter;
