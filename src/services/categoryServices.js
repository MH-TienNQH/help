import { OperationalException } from "../exceptions/operationalExceptions.js";
import { prismaClient } from "../routes/index.js";

export const getAllCategories = async () => {
  const category = await prismaClient.category.findMany({
    orderBy: {
      categoryId: "asc",
    },
  });
  return category;
};
export const findById = async (id) => {
  const isExist = await prismaClient.category.findUnique({
    where: {
      categoryId: parseInt(id),
    },
  });
  if (isExist) {
    return await prismaClient.category.findFirst({
      where: {
        categoryId: parseInt(id),
      },
    });
  }
  throw new OperationalException(404, false, "Category not found");
};
export const addCategory = async (data) => {
  const isExist = await prismaClient.category.findUnique({
    where: {
      categoryName: data.categoryName,
    },
  });
  if (isExist) {
    throw new OperationalException(400, false, "Category already exist");
  }
  return await prismaClient.category.create({
    data: {
      categoryName: data.categoryName,
    },
  });
};

export const updateCategory = async (id, data) => {
  const isExist = await prismaClient.category.findUnique({
    where: {
      categoryId: parseInt(id),
    },
  });
  if (isExist) {
    await prismaClient.category.update({
      where: {
        categoryId: parseInt(id),
      },
      data: {
        categoryName: data.categoryName,
      },
    });
    return true;
  }
  throw new OperationalException(404, false, "Category not found");
};

export const deleteCategory = async (id) => {
  const isExist = await prismaClient.category.findUnique({
    where: {
      categoryId: parseInt(id),
    },
  });
  if (isExist) {
    await prismaClient.category.delete({
      where: {
        categoryId: parseInt(id),
      },
    });
    return true;
  }
  throw new OperationalException(404, false, "Category not found");
};
