import { validationResult } from "express-validator";
import { prismaClient } from "../routes/index.js";
import { OperationalException } from "../exceptions/operationalExceptions.js";

export const getAllCategory = async (req, res, next) => {
  try {
    let categories = await prismaClient.category.findMany();
    res.status(200).send(categories);
  } catch (error) {
    next(error);
  }
};
export const getCategoryById = async (req, res, next) => {
  try {
    const id = req.params.id;
    let category = await prismaClient.category.findFirst({
      where: {
        categoryId: parseInt(id),
      },
    });
    if (!category) {
      const error = new OperationalException(
        " this category doesn't exist",
        404
      );
      next(error);
    }
    res.status(200).send(category);
  } catch (error) {
    next(error);
  }
};

export const addCategory = async (req, res, next) => {
  try {
    let result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send(result.array({ onlyFirstError: true }));
    }
    let userRole = req.userRole;
    const { categoryName } = req.body;
    try {
      let category = await prismaClient.category.findFirst({
        where: {
          categoryName,
        },
      });
      if (category) {
        const error = new OperationalException("Category already exist", 400);
        next(error);
      }
      category = await prismaClient.category.create({
        data: {
          categoryName,
        },
      });
      res.status(200).send(category);
    } catch (error) {
      return res.status(500).send(error);
    }
  } catch (error) {
    next(error);
  }
};
export const updateCategory = async (req, res, next) => {
  try {
    let result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send(result.array({ onlyFirstError: true }));
    }
    let userRole = req.userRole;
    const id = req.params.id;
    const { categoryName } = req.body;
    try {
      let category = await prismaClient.category.update({
        where: {
          categoryId: parseInt(id),
        },
        data: {
          categoryName,
        },
      });
      if (!category) {
        const error = new OperationalException("Category not found", 403);
        next(error);
      }
      res.status(200).send(category);
    } catch (error) {
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    let userRole = req.userRole;
    if (userRole == "Admin") {
      const id = req.params.id;
      try {
        await prismaClient.category.delete({
          where: {
            categoryId: parseInt(id),
          },
        });
        res.status(200).send("ok");
      } catch (error) {
        next(error);
      }
    } else {
      res.status(403).send("not Admin");
    }
  } catch (error) {
    next(error);
  }
};
