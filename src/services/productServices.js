import { prismaClient } from "../routes/index.js";

export const getAllProduct = async () => {
  await prismaClient.product.findMany({});
};
export const findById = async (id) => {
  return await prismaClient.product.findFirst({
    where: {
      productId: id,
    },
    include: {
      _count: {
        select: {
          likeNumber: true,
        },
      },
    },
  });
};
export const addProduct = async (data) => {
  await prismaClient.product.create({
    data: {
      name: data.name,
      description: data.description,
      image: data.image,
      price: data.price,
      cover: data.cover,
      category: {
        connect: {
          categoryId: data.categoryId,
        },
      },
      author: {
        connect: {
          userId: req.userId,
        },
      },
    },
  });
};

export const updateProduct = async (id, data) => {
  await prismaClient.product.update({
    where: {
      productId: parseInt(id),
    },
    data: {
      name: data.name,
      description: data.description,
      image: data.image,
      price: data.price,
      cover: data.cover,
      category: {
        connect: {
          categoryId: data.categoryId,
        },
      },
      author: {
        connect: {
          userId: req.userId,
        },
      },
    },
  });
};

export const deleteProduct = async (id) => {
  await prismaClient.product.delete({
    where: {
      productId: parseInt(id),
    },
  });
};

export const getThreeTrendingProduct = async () => {
  await prismaClient.product.findMany({
    include: {
      _count: {
        select: {
          likeNumber: true,
        },
      },
    },
    orderBy: {
      likeNumber: {
        _count: "desc",
      },
    },
    take: 3,
  });
};

export const getSellingProduct = async () => {
  await prismaClient.product.findMany({
    where: {
      status: "Selling",
    },
  });
};

export const getNewestProduct = async () => {
  await prismaClient.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getSoldProduct = async () => {
  await await prismaClient.product.findMany({
    where: {
      status: "Sold",
    },
  });
};
