import { prismaClient } from "../routes/index.js";
import { hashSync } from "bcrypt";

export const getAllUser = async (req, res) => {
  try {
    let users = await prismaClient.user.findMany();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getUserById = async (req, res) => {
  const id = req.params.id;
  let userById = await prismaClient.user.findFirst({
    where: {
      userId: parseInt(id),
    },
  });
  res.status(200).send(userById);
};

export const addUser = async (req, res) => {
  try {
    const { username, email, password, name, avatar } = req.body;

    let user = await prismaClient.user.findFirst({
      where: {
        username: username,
      },
    });
    if (user) {
      res.status(400).send("user exist");
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
    res.status(500).send(error);
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id;
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
    res.status(500).send(error);
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    await prismaClient.user.delete({
      where: {
        userId: parseInt(id),
      },
    });
    res.status(200).send("ok");
  } catch (error) {
    res.status(500).send(error);
  }
};

export const saveProduct = async (req, res) => {
  const productId = req.body.productId;
  const tokenUserId = req.userId;
  try {
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
    throw new Error(error);
  }
};

export const personalProduct = async (req, res) => {
  const userId = req.params.userId;
  try {
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
    res.status(500).send(error);
  }
};
