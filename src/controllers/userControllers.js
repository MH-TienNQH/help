import { prismaClient } from "../routes/index.js";
import { hashSync } from "bcrypt";

export const getAllUser = async (req, res, next) => {
  try {
    let users = await prismaClient.user.findMany();
    res.status(200).send(users);
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
    res.status(200).send(userById);
  } catch (error) {
    next(error);
  }
};

export const addUser = async (req, res, next) => {
  try {
    let userRole = req.userRole;
    if (userRole == "Admin") {
      try {
        const { username, email, password, name, avatar } = req.body;

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
            avatar,
          },
        });
        res.status(200).send(user);
      } catch (error) {
        next(error);
      }
    }
    res.status(403).send("Not admin");
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const id = req.params.id;
  let userRole = req.userRole;
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
      res.status(200).send(user);
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
      res.status(200).send(user);
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
      res.status(200).send("ok");
    } catch (error) {
      next(error);
    }
  }
};

export const saveProduct = async (req, res, next) => {
  try {
    const productId = req.body.productId;
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
      res.status(200).send("unliked");
    } else {
      await prismaClient.productSaved.create({
        data: {
          userId: tokenUserId,
          productId,
        },
      });
      res.status(200).send("liked product");
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
    res.status(200).send({ userProduct, savedProducts });
  } catch (error) {
    next(error);
  }
};
