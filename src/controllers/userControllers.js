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
  res.send(new responseFormat(200, true, userById.email));
});

export const addUser = asyncErrorHandler(async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
  }
  try {
    const data = req.body;
    const avatar = req.file.filename;
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
  const avatar = req.file.filename;
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
  res.send(new responseFormat(200, true, [user.email, "user updated"]));
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
  if (save) {
    res.send(new responseFormat(200, true, "saved product"));
  }
  res.send(new responseFormat(200, true, "unsave product"));
});

export const personalProduct = asyncErrorHandler(async (req, res) => {
  const userId = parseInt(req.params.id);
  const userProduct = await prismaClient.product.findMany({
    where: {
      userId,
    },
  });
  const saved = await prismaClient.productSaved.findMany({
    where: {
      userId,
    },
    include: {
      product: true,
    },
  });

  const savedProducts = saved.map((item) => item.product);
  res.send(
    new responseFormat(200, true, [
      { userProduct: userProduct, savedProducts: savedProducts },
    ])
  );
});
export const likeProduct = asyncErrorHandler(async (req, res) => {
  const productId = parseInt(req.params.id);
  const userId = req.userId;
  const like = await userServices.likeProduct(userId, productId);
  res.send(new responseFormat(200, true, like));
});
