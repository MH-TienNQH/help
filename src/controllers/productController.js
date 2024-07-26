import { prismaClient } from "../routes/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { validationResult } from "express-validator";

dotenv.config();

export const getAllProduct = async (req, res, next) => {
  try {
    let products = await prismaClient.product.findMany();
    res.status(200).send(products);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const productId = req.params.id;
    let product = await prismaClient.product.findFirst({
      where: {
        productId: parseInt(productId),
      }
    const accessToken = req.cookies.accessToken;
    if (accessToken) {
      jwt.verify(accessToken, process.env.JWT_KEY, async (error, payload) => {
        if (error) next(error);
        const saved = await prismaClient.productSaved.findUnique({
          where: {
            productId_userId: {
              productId: parseInt(productId),
              userId: payload.userId,
            },
          },
        });
        res.status(200).json({ ...product, isSaved: saved ? true : false });
      });
    }
  } catch (error) {
    next(error);
  }
};

export const addProduct = async (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send(result.array({ onlyFirstError: true }));
    }
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
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
  }
  const productId = req.params.id;
  const { name, description, image, price, cover, categoryId } = req.body;
  try {
    let product = await prismaClient.product.update({
      where: {
        productId: parseInt(productId),
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
        author: {
          connect: {
            userId: req.userId,
          },
        },
      },
    });
    if (!product) {
      const error = new OperationalException("Product not found", 404);
      next(error);
    }
    res.status(200).send(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    await prismaClient.product.delete({
      where: {
        productId,
      },
    });
    res.status(200).send("ok");
  } catch (error) {
    next(error);
  }
};
export const getThreeTrendingProduct = async (req, res, next) => {
  try {
    let products = await prismaClient.product.findMany({
      include: {
        _count: {
          select: {
            likeNumber: true,
          },
        },
      },
      orderBy: {
        likeNumber: {
          _count: "desc",
        },
      },
      take: 3,
    });
    res.status(200).send(products);
  } catch (error) {
    next(error);
  }
};
