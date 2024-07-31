import { prismaClient } from "../routes/index.js";

export const getAllCategories = async () => {
  await prismaClient.category.findMany({});
};
export const findById = async (id) => {
  return await prismaClient.product.findFirst({
    where: {
      categoryId: parseInt(id),
    },
  });
};
export const addCategory = async (data) => {
  const category = await prismaClient.category.create({
    data: {
      categoryName: data.categoryName,
    },
  });
  return category;
};

export const updateCategory = async (id, data) => {
  const category = await prismaClient.category.update({
    where: {
      categoryId: parseInt(id),
    },
    data: {
      categoryName: data.categoryName,
    },
  });
  return category;
};

export const deleteCategory = async (id) => {
  await prismaClient.category.delete({
    where: {
      categoryId: parseInt(id),
    },
  });
};
