import { prismaClient } from "../routes/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { validationResult } from "express-validator";
import { responseFormat } from "../utils/responseFormat.js";
import * as productServices from "../services/productServices.js";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";

dotenv.config();

export const getAllProduct = asyncErrorHandler(async (req, res) => {
  let products = await productServices.getAllProduct();
  res.send(new responseFormat(200, true, products));
});

export const getProductById = asyncErrorHandler(async (req, res) => {
  const productId = parseInt(req.params.id);
  const userId = req.userId;
  let product = await productServices.findById(productId);

  const saved = await prismaClient.productSaved.findUnique({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
  });
  res.send(
    new responseFormat(200, true, [
      { ...product, isSaved: saved ? true : false },
    ])
  );
});

export const addProduct = async (req, res) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send(result.array({ onlyFirstError: true }));
    }
    const data = req.body;
    const userId = req.userId;
    const cover = req.file.filename;
    const product = await productServices.addProduct(data, cover, userId);

    res.send(new responseFormat(200, true, [product.name, "product created"]));
  } catch (error) {
    console.log(error);
  }
};

export const updateProduct = asyncErrorHandler(async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
  }
  const productId = req.params.id;
  const data = req.body;
  const userId = req.userId;
  const cover = req.file.filename;
  const images = req.files.map((file) => file.filename);

  let product = await productServices.updateProduct(
    productId,
    data,
    userId,
    cover,
    images
  );
  if (!product) {
    const error = new OperationalException("Product not found", 404);
    next(error);
  }
  res.send(new responseFormat(200, true, [product.name, "product updated"]));
});

export const deleteProduct = asyncErrorHandler(async (req, res) => {
  const productId = req.params.id;
  await productServices.deleteProduct(productId);
  res.send(new responseFormat(200, true, ["product deleted"]));
});
export const getThreeTrendingProduct = asyncErrorHandler(async (req, res) => {
  let products = await productServices.getThreeTrendingProduct();
  res.send(new responseFormat(200, true, products));
});
export const getSellingProduct = asyncErrorHandler(async (req, res) => {
  let products = await productServices.getSellingProduct();
  res.send(new responseFormat(200, true, products));
});

export const getNewestProduct = asyncErrorHandler(async (req, res) => {
  let products = await productServices.getNewestProduct();
  res.send(new responseFormat(200, true, products));
});

export const getSoldProduct = asyncErrorHandler(async (req, res) => {
  let products = await productServices.getSoldProduct();
  res.send(new responseFormat(200, true, products));
});

export const getProductByCategory = asyncErrorHandler(async (req, res) => {
  const { categoryName } = req.body;
  const response = await productServices.getProductByCategory(categoryName);
  res.send(new responseFormat(200, true, response));
});
