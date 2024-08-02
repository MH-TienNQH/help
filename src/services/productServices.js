import { prismaClient } from "../routes/index.js";
import { OperationalException } from "../exceptions/operationalExceptions.js";

export const getAllProduct = async () => {
  await prismaClient.product.findMany({});
};
export const findById = async (id) => {
  const product = await prismaClient.product.findUnique({
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
  if (!product) {
    throw new OperationalException("No product found", 404);
  }
  return product;
};
export const addProduct = async (data, cover, userId) => {
  let product = await prismaClient.product.findUnique({
    where: {
      name: data.name,
    },
  });
  if (product) {
    throw new OperationalException("Product exist", 403);
  }
  product = await prismaClient.product.create({
    data: {
      name: data.name,
      description: data.description,
      image: data.image,
      price: parseInt(data.price),
      cover: cover,
      category: {
        connect: {
          categoryId: parseInt(data.categoryId),
        },
      },
      author: {
        connect: {
          userId: userId,
        },
      },
    },
  });
  return product;
};

export const updateProduct = async (id, data, userId, cover, images) => {
  await prismaClient.product.update({
    where: {
      productId: parseInt(id),
    },
    data: {
      name: data.name,
      description: data.description,
      image: images,
      price: data.price,
      cover: cover,
      category: {
        connect: {
          categoryId: data.categoryId,
        },
      },
      author: {
        connect: {
          userId,
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
export const getProductByCategory = async (categoryName) => {
  const products = await prismaClient.product.findMany({
    where: {
      category: {
        categoryName: categoryName,
      },
    },
  });
  return products;
};
