import { body, validationResult } from "express-validator";
import { prismaClient } from "../routes/index.js";
import { hashSync } from "bcrypt";
import {
  responseFormat,
  responseFormatForErrors,
} from "../utils/responseFormat.js";
import * as userServices from "../services/userServices.js";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";

export const getAllUser = asyncErrorHandler(async (req, res) => {
  const { name, order, role } = req.query;
  const { page, limit } = req.pagination;
  let users = await userServices.getAllUser(name, order, role, page, limit);
  res.send(new responseFormat(200, true, users));
});

export const getUserById = asyncErrorHandler(async (req, res, next) => {
  const id = parseInt(req.params.id);
  let userById = await userServices.findById(id);
  if (!userById) {
    const error = new OperationalException("User not found", 404);
    next(error);
  }
  res.send(new responseFormat(200, true, userById));
});

export const addUser = asyncErrorHandler(async (req, res, next) => {
  if (!req.files.avatar) {
    return res.json(
      new responseFormatForErrors(401, false, {
        message: "Avatar cannot be empty",
      })
    );
  }

  if (req.files.avatar && req.files.avatar.length > 1) {
    return res.json(
      new responseFormatForErrors(401, false, {
        message: "You can only add one avatar",
      })
    );
  }
  try {
    const data = req.body;
    const avatar = req.cloudinaryUrls;
    const user = await userServices.addUser(data, avatar);
    res.send(new responseFormat(200, true, user));
  } catch (error) {
    next(error);
  }
});

export const updateUser = asyncErrorHandler(async (req, res, next) => {
  if (req.files.avatar && req.files.avatar.length > 1) {
    return res.json(
      new responseFormatForErrors(401, false, {
        message: "You can only add one avatar",
      })
    );
  }
  const id = parseInt(req.params.id);
  const userId = req.userId;
  const userRole = req.userRole;
  const data = req.body;
  const avatar = req.cloudinaryUrls;

  const user = await userServices.updateUser(
    id,
    userId,
    userRole,
    data,
    avatar
  );
  res.send(new responseFormat(200, true, user));
});

export const deleteUser = asyncErrorHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.userId;
  const userRole = req.userRole;
  const response = await userServices.deleteUser(id, userId, userRole);
  res.send(response);
});

export const saveProduct = asyncErrorHandler(async (req, res) => {
  const productId = parseInt(req.params.id);
  const userId = req.userId;
  const save = await userServices.saveProduct(userId, productId);
  res.send(save);
});

export const personalProduct = asyncErrorHandler(async (req, res) => {
  const { order, status, requestStatus, categoryId } = req.query;
  const { page, limit } = req.pagination;
  const userId = parseInt(req.userId);
  const response = await userServices.personalProduct(
    userId,
    order,
    categoryId,
    status,
    requestStatus,
    page,
    limit
  );
  res.send(
    new responseFormat(200, true, [
      {
        userProduct: response.userProducts,
        savedProducts: response.savedProducts,
        requestedProduct: response.requestedProducts,
      },
    ])
  );
});
export const likeProduct = asyncErrorHandler(async (req, res) => {
  const productId = parseInt(req.params.id);
  const userId = req.userId;
  const liked = await userServices.likeProduct(userId, productId);
  res.send(liked);
});

export const requestToBuy = asyncErrorHandler(async (req, res) => {
  const productId = parseInt(req.params.id);
  const userId = req.userId;
  const { message, offer } = req.body;
  const requested = await userServices.requestToBuyProduct(
    userId,
    productId,
    message,
    offer
  );
  res.send(requested);
});

export const approveRequest = asyncErrorHandler(async (req, res) => {
  const userId = parseInt(req.params.userId);
  const productId = parseInt(req.params.productId);
  const ownerId = req.userId;

  const response = await userServices.approveRequest(
    ownerId,
    productId,
    userId
  );
  res.send(response);
});

export const rejectRequest = asyncErrorHandler(async (req, res) => {
  const userId = parseInt(req.params.userId);
  const productId = parseInt(req.params.productId);
  const ownerId = req.userId;

  const response = await userServices.rejectRequest(ownerId, productId, userId);
  res.send(new responseFormat(200, true, response));
});
export const countUsers = asyncErrorHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const response = await userServices.countUsers(startDate, endDate);
  res.send(new responseFormat(200, true, response));
});

export const createChart = asyncErrorHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const response = await userServices.createChartForTrending(
    startDate,
    endDate
  );
  res.send(new responseFormat(200, true, response));
});
