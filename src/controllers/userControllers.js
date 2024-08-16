import { body, validationResult } from "express-validator";
import { prismaClient } from "../routes/index.js";
import { hashSync } from "bcrypt";
import { responseFormat } from "../utils/responseFormat.js";
import * as userServices from "../services/userServices.js";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";

export const getAllUser = asyncErrorHandler(async (req, res) => {
  let users = await userServices.getAllUser();
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
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
  }
  try {
    const data = req.body;
    const avatar = req.cloudinaryUrls;
    let user = await prismaClient.user.findFirst({
      where: {
        username: data.username,
      },
    });
    if (user) {
      const error = new OperationalException("User already exist", 400);
      next(error);
    }
    user = await userServices.addUser(data, avatar);
    res.send(new responseFormat(200, true, [user.email, "user created"]));
  } catch (error) {
    next(error);
  }
});

export const updateUser = asyncErrorHandler(async (req, res, next) => {
  const id = parseInt(req.params.id);

  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
  }

  const data = req.body;
  const avatar = req.cloudinaryUrls;
  let user = await prismaClient.user.findFirst({
    where: {
      username: data.username,
    },
  });
  if (user) {
    const error = new OperationalException("User already exist", 400);
    next(error);
  }
  user = await userServices.updateUser(id, data, avatar);
  res.send(new responseFormat(200, true, user));
});

export const deleteUser = asyncErrorHandler(async (req, res) => {
  const id = parseInt(req.params.id);

  await userServices.deleteUser(id);
  res.send(new responseFormat(200, true, "user deleted"));
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
  res.send(response);
});
