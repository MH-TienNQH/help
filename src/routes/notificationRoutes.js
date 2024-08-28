import { Router } from "express";
import {
  addNoti,
  deleteNoti,
  getAllNotification,
  getNotificationById,
} from "../controllers/notificationController.js";
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";

export const notiRoutes = Router();

notiRoutes.get("/get-all-noti", verifyTokenMiddlewares, getAllNotification);
notiRoutes.get(
  "/get-by-id/:notiId",
  verifyTokenMiddlewares,
  getNotificationById
);
notiRoutes.post("/add-noti/:userId", verifyTokenMiddlewares, addNoti);
notiRoutes.delete("/delete/:notiId", verifyTokenMiddlewares, deleteNoti);
