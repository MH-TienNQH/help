import { validationResult } from "express-validator";
import { prismaClient } from "../routes/index.js";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import {
  responseFormat,
  responseFormatForErrors,
} from "../utils/responseFormat.js";
import * as categoryServices from "../services/categoryServices.js";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";

export const getAllCategory = asyncErrorHandler(async (req, res) => {
  let categories = await categoryServices.getAllCategories();
  res.status(200).send(categories);
});
export const getCategoryById = asyncErrorHandler(async (req, res) => {
  const id = req.params.id;
  let category = await categoryServices.findById(id);
  res.status(200).send(category);
});

export const addCategory = asyncErrorHandler(async (req, res) => {
  const data = req.body;
  const response = await categoryServices.addCategory(data);
  res.send(new responseFormat(200, true, response));
});
export const updateCategory = asyncErrorHandler(async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const response = await categoryServices.updateCategory(id, data);
  res.send(new responseFormat(200, true, response));
});

export const deleteCategory = asyncErrorHandler(async (req, res) => {
  const id = req.params.id;
  const response = await categoryServices.deleteCategory(id);
  res.send(new responseFormat(200, true, response));
});
