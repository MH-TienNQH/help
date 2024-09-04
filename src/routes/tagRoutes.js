import { Router } from "express";
import { getUsers } from "../controllers/tagController.js";

export const tagRoutes = Router();

tagRoutes.get("/search", getUsers);
