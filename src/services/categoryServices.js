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
  return await prismaClient.category.findFirst({
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
