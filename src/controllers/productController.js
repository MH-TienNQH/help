import { prismaClient } from "../routes/index.js";
import dotenv from "dotenv";
import { validationResult } from "express-validator";

import {
  responseFormat,
  responseFormatWithPagination,
} from "../utils/responseFormat.js";
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
  let product = await productServices.findById(userId, productId);
  if (product.product.userId == userId) {
    res.send(
      new responseFormat(200, true, [
        {
          ...product.product,
          isSaved: product.saved ? true : false,
          isLiked: product.liked ? true : false,
          isRequested: product.requested ? true : false,
          requests: product.requests.data,
        },
      ])
    );
  } else {
    res.send(
      new responseFormat(200, true, [
        {
          ...product.product,
          isSaved: product.saved ? true : false,
          isLiked: product.liked ? true : false,
          isRequested: product.requested ? true : false,
        },
      ])
    );
  }
});

export const addProduct = async (req, res) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
  }
  const data = req.body;
  const userId = req.userId;
  const images = req.cloudinaryUrls;

  const response = await productServices.addProduct(data, images, userId);

  res.send(response);
};

export const updateProduct = asyncErrorHandler(async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
  }
  const productId = req.params.id;
  const data = req.body;
  const userId = req.userId;
  const userRole = req.userRole;
  const images = req.cloudinaryUrls;

  let product = await productServices.updateProduct(
    productId,
    data,
    userId,
    userRole,
    images
  );
  res.send(product);
});

export const deleteProduct = asyncErrorHandler(async (req, res) => {
  const userId = req.userId;
  const userRole = req.userRole;
  const productId = req.params.id;

  const response = await productServices.deleteProduct(
    productId,
    userId,
    userRole
  );
  res.send(response);
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
export const listProduct = asyncErrorHandler(async (req, res) => {
  const { productName, categoryId, order, status } = req.query;
  const { page, limit } = req.pagination;

  let response = await productServices.listProduct(
    productName,
    categoryId,
    order,
    status,
    page,
    limit
  );
  res.send(
    new responseFormatWithPagination(
      200,
      true,
      response.productsWithImageUrls,
      response.meta
    )
  );
});

export const approveProduct = asyncErrorHandler(async (req, res) => {
  const productId = parseInt(req.params.id);
  const response = await productServices.approveProduct(productId);
  res.send(response);
});

export const rejectProduct = asyncErrorHandler(async (req, res) => {
  const productId = parseInt(req.params.id);
  const { message } = req.body;
  const response = await productServices.rejectProduct(productId, message);
  res.send(response);
});
