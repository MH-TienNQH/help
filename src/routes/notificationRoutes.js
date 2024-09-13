import { Router } from "express";
import {
  deleteNoti,
  getAllNotification,
  getNotificationById,
} from "../controllers/notificationController.js";
import verifyTokenMiddlewares from "../middlewares/verifyTokenMiddlewares.js";

export const notiRoutes = Router();

notiRoutes.use(verifyTokenMiddlewares);

notiRoutes.get("/get-all-noti", getAllNotification);
notiRoutes.get("/get-by-id/:notiId", getNotificationById);
notiRoutes.delete("/delete/:notiId", deleteNoti);
