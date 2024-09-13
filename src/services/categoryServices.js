import { CategoryOperationalErrorConstant } from "../constants/constants.js";
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
  throw new OperationalException(
    404,
    false,
    CategoryOperationalErrorConstant.CATEGORY_NOT_FOUND_ERROR
  );
};
export const addCategory = async (data) => {
  const isExist = await prismaClient.category.findUnique({
    where: {
      categoryName: data.categoryName,
    },
  });
  if (isExist) {
    throw new OperationalException(
      400,
      false,
      CategoryOperationalErrorConstant.CATEGORY_EXIST_ERROR
    );
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
  throw new OperationalException(
    404,
    false,
    CategoryOperationalErrorConstant.CATEGORY_NOT_FOUND_ERROR
  );
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
  throw new OperationalException(
    404,
    false,
    CategoryOperationalErrorConstant.CATEGORY_NOT_FOUND_ERROR
  );
};
