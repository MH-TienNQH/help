import { prismaClient } from "../routes/index.js";
import { OperationalException } from "../exceptions/operationalExceptions.js";

export const getAllProduct = async () => {
  let products = await prismaClient.product.findMany({});
  return products;
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
export const addProduct = async (data, image, userId) => {
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
      image,
      price: parseInt(data.price),
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

export const updateProduct = async (productId, data, userId, image) => {
  let product = await prismaClient.product.findUnique({
    where: {
      productId: parseInt(productId),
    },
  });
  if (!product) {
    throw new OperationalException("Product not found", 404);
  }
  product = await prismaClient.product.findUnique({
    where: {
      name: data.name,
    },
  });
  if (product) {
    throw new OperationalException("Product exist", 403);
  }
  product = await prismaClient.product.update({
    where: {
      productId: parseInt(productId),
    },
    data: {
      name: data.name,
      description: data.description,
      image,
      price: parseInt(data.price),
      category: {
        connect: {
          categoryId: parseInt(data.categoryId),
        },
      },
      author: {
        connect: {
          userId,
        },
      },
    },
  });
  return product;
};

export const deleteProduct = async (id) => {
  await prismaClient.product.delete({
    where: {
      productId: parseInt(id),
    },
  });
};

export const getThreeTrendingProduct = async () => {
  const products = await prismaClient.product.findMany({
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
  return products;
};

export const getSellingProduct = async () => {
  const products = await prismaClient.product.findMany({
    where: {
      status: "Selling",
    },
  });
  return products;
};

export const getNewestProduct = async () => {
  const products = await prismaClient.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return products;
};

export const getSoldProduct = async () => {
  const products = await await prismaClient.product.findMany({
    where: {
      status: "Sold",
    },
  });
  return products;
};
export const listProduct = async (
  productName,
  categoryId,
  order,
  page,
  limit
) => {
  if (!["asc", "desc"].includes(order)) {
    return res.status(400).json({ error: "Invalid order value" });
  }

  const skip = (page - 1) * limit;

  let numberOfProducts = await prismaClient.product.count({
    where: {
      name: {
        contains: productName || "", // Search for products where the name contains the specified value
      },
      ...(categoryId ? { categoryId: parseInt(categoryId) } : {}),
    },
  });

  let products = await prismaClient.product.findMany({
    where: {
      name: {
        contains: productName || "", // Search for products where the name contains the specified value
      },
      ...(categoryId ? { categoryId: parseInt(categoryId) } : {}),
    },
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(numberOfProducts / limit);
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  return {
    products,
    meta: {
      privious_page: previousPage,
      current_page: page,
      next_page: nextPage,
      total: totalPages,
    },
  };
};
export const verifyProduct = async (productId) => {
  const product = await prismaClient.product.update({
    where: {
      productId,
    },
    data: {
      pending: false,
    },
  });
  return product;
};
