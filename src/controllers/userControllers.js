import { body, validationResult } from "express-validator";
import { prismaClient } from "../routes/index.js";
import { hashSync } from "bcrypt";
import { responseFormat } from "../utils/responseFormat.js";
import * as userServices from "../services/userServices.js";
import { OperationalException } from "../exceptions/operationalExceptions.js";

export const getAllUser = async (req, res, next) => {
  try {
    let users = await userServices.getAllUser();
    res.send(new responseFormat(200, true, users));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    let userById = await userServices.findById(id);
    if (!userById) {
      const error = new OperationalException("User not found", 404);
      next(error);
    }
    res.send(new responseFormat(200, true, userById.email));
  } catch (error) {
    next(error);
  }
};

export const addUser = async (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send(result.array({ onlyFirstError: true }));
    }
    try {
      const data = req.body;
      let user = await prismaClient.user.findFirst({
        where: {
          username: data.username,
        },
      });
      if (user) {
        const error = new OperationalException("User already exist", 400);
        next(error);
      }
      user = await userServices.addUser(data);
      res.send(new responseFormat(200, true, [user.email, "user created"]));
    } catch (error) {
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const id = parseInt(req.params.id);

  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
  }
  try {
    const data = req.body;
    let user = await prismaClient.user.findFirst({
      where: {
        username: data.username,
      },
    });
    if (user) {
      const error = new OperationalException("User already exist", 400);
      next(error);
    }
    user = await userServices.updateUser(id, data);
    res.send(new responseFormat(200, true, [user.email, "user updated"]));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  const id = parseInt(req.params.id);
  try {
    await userServices.deleteUser(id);
    res.send(new responseFormat(200, true, "user deleted"));
  } catch (error) {
    next(error);
  }
};

export const saveProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const userId = req.userId;
    const save = await userServices.saveProduct(userId, productId);
    if (save) {
      res.send(new responseFormat(200, true, "saved product"));
    }
    res.send(new responseFormat(200, true, "unsave product"));
  } catch (error) {
    next(error);
  }
};

export const personalProduct = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
};
export const likeProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const userId = req.userId;
    const liked = await userServices.likeProduct(userId, productId);
    if (save) {
      res.send(new responseFormat(200, true, "liked product"));
    }
    res.send(new responseFormat(200, true, "unliked product"));
  } catch (error) {
    next(error);
  }
};
