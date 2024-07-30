import { validationResult } from "express-validator";
import { prismaClient } from "../routes/index.js";
import { hashSync } from "bcrypt";
import { responseFormat } from "../utils/responseFormat.js";
import { userInfo } from "os";

export const getAllUser = async (req, res, next) => {
  try {
    let users = await prismaClient.user.findMany();
    res.send(new responseFormat(200, true, users));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    let userById = await prismaClient.user.findFirst({
      where: {
        userId: parseInt(id),
      },
    });
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
    let userRole = req.userRole;
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send(result.array({ onlyFirstError: true }));
    }
    try {
      const { username, email, password, name, userRole, avatar } = req.body;

      let user = await prismaClient.user.findFirst({
        where: {
          username: username,
        },
      });
      if (user) {
        const error = new OperationalException("User already exist", 400);
        next(error);
      }
      user = await prismaClient.user.create({
        data: {
          name,
          username,
          email,
          password: hashSync(password, 10),
          userRole,
          avatar,
        },
      });
      res.send(new responseFormat(200, true, [user.email, "user created"]));
    } catch (error) {
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const id = req.params.id;
  let userRole = req.userRole;
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
  }
  if (userRole == "Admin") {
    try {
      const { username, email, password, name, userRole, avatar } = req.body;
      let user = await prismaClient.user.update({
        where: {
          userId: parseInt(id),
        },
        data: {
          name,
          username,
          email,
          password: hashSync(password, 10),
          userRole,
          avatar,
        },
      });
      if (!user) {
        const error = new OperationalException("User already exist", 400);
        next(error);
      }
      res.send(new responseFormat(200, true, [user.email, "user updated"]));
    } catch (error) {
      next(error);
    }
  } else {
    try {
      const { username, email, password, name, avatar } = req.body;
      let user = await prismaClient.user.update({
        where: {
          userId: parseInt(id),
        },
        data: {
          name,
          username,
          email,
          password: hashSync(password, 10),
          avatar,
        },
      });
      res.send(new responseFormat(200, true, [user.email, "user updated"]));
    } catch (error) {
      next(error);
    }
  }
};

export const deleteUser = async (req, res, next) => {
  let userRole = req.userRole;
  const id = req.params.id;
  if (userRole == "Admin") {
    try {
      await prismaClient.user.delete({
        where: {
          userId: parseInt(id),
        },
      });
      res.send(new responseFormat(200, true, "user deleted"));
    } catch (error) {
      next(error);
    }
  }
};

export const saveProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const tokenUserId = req.userId;
    const savedProduct = await prismaClient.productSaved.findUnique({
      where: {
        productId_userId: {
          userId: tokenUserId,
          productId,
        },
      },
    });

    if (savedProduct) {
      await prismaClient.productSaved.delete({
        where: {
          productId_userId: {
            userId: tokenUserId,
            productId,
          },
        },
      });
      res.send(new responseFormat(200, true, "saved product"));
    } else {
      await prismaClient.productSaved.create({
        data: {
          userId: tokenUserId,
          productId,
        },
      });
      res.send(new responseFormat(200, true, "unsaved product"));
    }
  } catch (error) {
    next(error);
  }
};

export const personalProduct = async (req, res, next) => {
  try {
    const userId = req.params.userId;
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
    const productId = req.params.productId;
    const tokenUserId = req.userId;
    const likedProduct = await prismaClient.productLiked.findUnique({
      where: {
        productId_userId: {
          userId: tokenUserId,
          productId,
        },
      },
    });

    if (likedProduct) {
      await prismaClient.productLiked.delete({
        where: {
          productId_userId: {
            userId: tokenUserId,
            productId,
          },
        },
      });
      res.send(new responseFormat(200, true, "unliked product"));
    } else {
      await prismaClient.productLiked.create({
        data: {
          userId: tokenUserId,
          productId,
        },
      });
      res.send(new responseFormat(200, true, "liked product"));
    }
  } catch (error) {
    next(error);
  }
};
