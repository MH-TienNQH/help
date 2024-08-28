import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";
import * as notificationServices from "../services/notificationServices.js";
import { responseFormat } from "../utils/responseFormat.js";

export const getAllNotification = asyncErrorHandler(async (req, res) => {
  const response = await notificationServices.getAllNotification();
  res.send(new responseFormat(200, true, response));
});

export const getNotificationById = asyncErrorHandler(async (req, res) => {
  const notificationId = parseInt(req.params);
  const userId = req.userId;
  const response = await notificationServices.getById(userId, notificationId);
  res.send(new responseFormat(200, true, response));
});

export const addNoti = asyncErrorHandler(async (req, res) => {
  const userId = parseInt(req.params);
  const data = req.body;
  const response = await notificationServices.addNoti(userId, data);
  res.send(new responseFormat(200, true, response));
});

export const deleteNoti = asyncErrorHandler(async (req, res) => {
  const userId = req.userId;
  const notificationId = parseInt(req.params);
  const response = await notificationServices.deleteNoti(
    userId,
    notificationId
  );
  res.send(new responseFormat(200, true, response));
});
