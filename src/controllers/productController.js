import { prismaClient } from "../routes/index.js";
import jwt from "jsonwebtoken";

export const getAllProduct = async (req, res) => {
  try {
    let products = await prismaClient.product.findMany();
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getProductById = async (req, res) => {
  const id = req.params.id;
  try {
    let product = await prismaClient.product.findFirst({
      where: {
        productId: parseInt(id),
      },
    });
    res.status(200).send(product);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const addProduct = async (req, res) => {
  const { name, description, image, price, cover, categoryId } = req.body;

  let product = await prismaClient.product.create({
    data: {
      name,
      description,
      image,
      price,
      cover,
      category: {
        connect: {
          categoryId,
        },
      },
      author: {
        connect: {
          userId: req.userId,
        },
      },
    },
  });
  res.status(200).send(product);
};

export const updateProduct = async (req, res) => {
  const id = req.params.id;
  const { name, description, image, price, cover, categoryId } = req.body;
  try {
    let product = await prismaClient.product.update({
      where: {
        productId: parseInt(id),
      },
      data: {
        name,
        description,
        image,
        price,
        cover,
        category: {
          connect: {
            categoryId,
          },
        },
      },
    });
    res.status(200).send(product);
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteProduct = async (req, res) => {
  const id = req.params.id;
  try {
    await prismaClient.product.delete({
      where: {
        productId: parseInt(id),
      },
    });
    res.status(200).send("ok");
  } catch (error) {
    res.status(500).send(error);
  }
};
