import dotenv from "dotenv";

import {
  responseFormat,
  responseFormatForErrors,
  responseFormatWithPagination,
} from "../utils/responseFormat.js";
import * as productServices from "../services/productServices.js";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";
import { OperationalException } from "../exceptions/operationalExceptions.js";

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

          isRequested: product.requested || false,
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
          isRequested: product.requested || false,
        },
      ])
    );
  }
});

export const addProduct = async (req, res) => {
  if (!req.files.images || req.files.images.length === 0) {
    return res.json(
      new responseFormatForErrors(401, false, {
        message: "Images cannot be empty",
      })
    );
  }

  const numberOfFiles = req.files.images.length;
  if (numberOfFiles < 1 || numberOfFiles > 6) {
    return res.json(
      new responseFormatForErrors(401, false, {
        message: "You can only add one to six images",
      })
    );
  }
  const data = req.body;
  const userId = req.userId;
  const userRole = req.userRole;
  const images = req.cloudinaryUrls;

  try {
    const response = await productServices.addProduct(
      data,
      images,
      userId,
      userRole
    );
    res.send(new responseFormat(200, true, response));
  } catch (error) {
    if (error instanceof OperationalException) {
      res.status(error.statusCode).send({
        success: error.success,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

export const updateProduct = asyncErrorHandler(async (req, res, next) => {
  const productId = req.params.id;
  const data = req.body;
  const userId = req.userId;
  const userRole = req.userRole;
  let images = req.cloudinaryUrls || [];

  const numberOfFiles = req.files?.images?.length;

  if (req.files?.images && numberOfFiles > 6) {
    return res.json(
      new responseFormatForErrors(401, false, {
        message: "You can only add one to six images",
      })
    );
  }

  let response = await productServices.updateProduct(
    productId,
    data,
    userId,
    userRole,
    images
  );
  res.send(new responseFormat(200, true, response));
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
  res.send(new responseFormat(200, true, response));
});
export const getThreeTrendingProduct = asyncErrorHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  let products = await productServices.getThreeTrendingProduct(
    startDate,
    endDate
  );
  res.send(new responseFormat(200, true, products));
});

export const getNewestProduct = asyncErrorHandler(async (req, res) => {
  let products = await productServices.getNewestProduct();
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
  res.send(new responseFormat(200, true, response));
});

export const rejectProduct = asyncErrorHandler(async (req, res) => {
  const productId = parseInt(req.params.id);
  const { message } = req.body;
  const response = await productServices.rejectProduct(productId, message);
  res.send(new responseFormat(200, true, response));
});

export const countProducts = asyncErrorHandler(async (req, res) => {
  const { categoryId, status, startDate, endDate } = req.query;
  let response = await productServices.countProducts(
    categoryId,
    status,
    startDate,
    endDate
  );
  res.send(new responseFormat(200, true, response));
});
