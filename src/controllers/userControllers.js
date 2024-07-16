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
