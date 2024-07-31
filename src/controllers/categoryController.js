import { validationResult } from "express-validator";
import { prismaClient } from "../routes/index.js";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import { responseFormat } from "../utils/responseFormat.js";
import * as categoryServices from "../services/categoryServices.js";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";

export const getAllCategory = asyncErrorHandler(async (req, res) => {
  let categories = categoryServices.getAllCategories();
  await res.status(200).send(categories);
});
export const getCategoryById = asyncErrorHandler(async (req, res) => {
  const id = req.params.id;
  let category = await categoryServices.findById(id);
  if (!category) {
    const error = new OperationalException(" this category doesn't exist", 404);
    next(error);
  }
  res.status(200).send(category);
});

export const addCategory = asyncErrorHandler(async (req, res, next) => {
  let result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
  }
  const data = req.body;
  try {
    let category = await prismaClient.category.findFirst({
      where: {
        categoryName: data.categoryName,
      },
    });
    if (category) {
      const error = new OperationalException("Category already exist", 400);
      next(error);
    }
    category = await categoryServices.addCategory(data);
    res.status(200).send(category);
  } catch (error) {
    return res.status(500).send(error);
  }
});
export const updateCategory = asyncErrorHandler(async (req, res, next) => {
  let result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
  }
  const id = req.params.id;
  const data = req.body;
  try {
    let category = await categoryServices.updateCategory(id, data);
    if (!category) {
      const error = new OperationalException("Category not found", 403);
      next(error);
    }
    res.send(new responseFormat(200, true, category));
  } catch (error) {
    next(error);
  }
});

export const deleteCategory = asyncErrorHandler(async (req, res) => {
  const id = req.params.id;

  await categoryServices.deleteCategory(id);
  res.send(new responseFormat(200, true, "category deleted"));
});
