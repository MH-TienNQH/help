import { Router } from "express";
import { getUsers, tag } from "../controllers/tagController.js";
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";

export const tagRoutes = Router();

tagRoutes.get("/search", getUsers);
tagRoutes.post("/tag", verifyTokenMiddlewares, tag);
