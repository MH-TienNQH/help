import { prismaClient } from "../routes/index.js";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import {
  responseFormat,
  responseFormatForErrors,
} from "../utils/responseFormat.js";
import * as userServices from "./userServices.js";
import { Status } from "@prisma/client";

export const getAllProduct = async () => {
  return await prismaClient.product.findMany({
    include: {
      author: true,
    },
  });
};
export const findById = async (userId, productId) => {
  const product = await prismaClient.product.findUnique({
    where: {
      productId,
    },
    include: {
      _count: {
        select: {
          likeNumber: true,
        },
      },
      author: true,
      comments: {
        include: {
          user: true,
        },
      },
    },
  });
  if (product) {
    const saved = await prismaClient.productSaved.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });
    const liked = await prismaClient.productLiked.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });
    const requested = await prismaClient.requestToBuy.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });
    if (product.userId == userId) {
      const requests = await userServices.getListOfRequesterForOneProduct(
        productId
      );
      return { product, saved, liked, requested, requests };
    }
    return { product, saved, liked, requested };
  }
  throw new OperationalException(404, false, "No product found");
};
export const addProduct = async (data, images, userId) => {
  const isExist = await prismaClient.product.findFirst({
    where: {
      name: data.name,
    },
  });
  if (isExist) {
    throw new OperationalException(403, false, "Product exist");
  }
  return await prismaClient.product.create({
    data: {
      name: data.name,
      description: data.description,
      images: JSON.stringify(images),
      price: parseInt(data.price),
      author: {
        connect: {
          userId: userId,
        },
      },
    },
  });
};

export const updateProduct = async (
  productId,
  data,
  userId,
  userRole,
  images
) => {
  let isExist = await prismaClient.product.findUnique({
    where: {
      productId: parseInt(productId),
    },
  });
  if (!isExist) {
    throw new OperationalException(404, false, "Product not found");
  }
  if (product.userId !== userId && userRole !== "ADMIN") {
    throw new OperationalException(
      403,
      false,
      "You are not authorized to update this product"
    );
  }

  isExist = await prismaClient.product.findUnique({
    where: {
      name: data.name,
    },
  });
  if (isExist) {
    return new OperationalException(403, false, "Product exist");
  }

  await prismaClient.product.update({
    where: {
      productId: parseInt(productId),
    },
    data: {
      name: data.name,
      description: data.description,
      images: JSON.stringify(images),
      price: parseInt(data.price),
      author: {
        connect: {
          userId,
        },
      },
    },
  });
  return true;
};

export const deleteProduct = async (id, userId, userRole) => {
  let product = await prismaClient.product.findUnique({
    where: {
      productId: parseInt(id),
    },
  });
  if (!product) {
    throw new OperationalException(404, false, "Product not found");
  }
  if (product.userId !== userId && userRole !== "ADMIN") {
    throw new OperationalException(
      403,
      false,
      "You are not authorized to delete this product"
    );
  }

  await prismaClient.product.delete({
    where: {
      productId: parseInt(id),
    },
  });
  return true;
};

export const getThreeTrendingProduct = async () => {
  return await prismaClient.product.findMany({
    include: {
      _count: {
        select: {
          likeNumber: true,
        },
      },
      author: true,
    },
    orderBy: {
      likeNumber: {
        _count: "desc",
      },
    },
    take: 3,
  });
};

export const getNewestProduct = async () => {
  return await prismaClient.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: true,
    },
  });
};
export const listProduct = async (
  productName,
  categoryId,
  order = "desc",
  status,
  page,
  limit
) => {
  const skip = (page - 1) * limit;

  const validStatus = status
    ? Object.values(Status).includes(status.toUpperCase())
      ? status.toUpperCase()
      : null
    : null;

  const orderDirection = ["asc", "desc"].includes(order.toLowerCase())
    ? order.toLowerCase()
    : "desc";
  const validCategoryId = [1, 2].includes(parseInt(categoryId))
    ? parseInt(categoryId)
    : 1;
  let numberOfProducts = await prismaClient.product.count({
    where: {
      name: {
        contains: productName || "", // Search for products where the name contains the specified value
      },
      ...(validCategoryId ? { categoryId: validCategoryId } : {}),
      ...(validStatus ? { status: validStatus } : {}),
    },
  });

  let products = await prismaClient.product.findMany({
    where: {
      name: {
        contains: productName || "", // Search for products where the name contains the specified value
      },
      ...(validCategoryId ? { categoryId: validCategoryId } : {}),
      ...(validStatus ? { status: validStatus } : {}),
    },
    orderBy: {
      productId: orderDirection,
    },
    skip,
    take: limit,
    include: {
      author: true,
    },
  });
  const productsWithImageUrls = products.map((product) => ({
    ...product,
  }));

  const totalPages = Math.ceil(numberOfProducts / limit);
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  return {
    productsWithImageUrls,
    meta: {
      previous_page: previousPage,
      current_page: page,
      next_page: nextPage,
      total: totalPages,
    },
  };
};

export const approveProduct = async (productId) => {
  const isExist = await prismaClient.product.findUnique({
    where: {
      productId,
    },
  });
  if (isExist) {
    await prismaClient.product.update({
      where: {
        productId,
      },
      data: {
        status: "APPROVED",
        statusMessage: "Your product have been approved",
      },
    });
    return true;
  }
  throw new OperationalException(404, false, "Product not found");
};

export const rejectProduct = async (productId, message) => {
  const isExist = await prismaClient.product.findUnique({
    where: {
      productId,
    },
  });
  if (isExist) {
    await prismaClient.product.update({
      where: {
        productId,
      },
      data: {
        status: "REJECTED",
        statusMessage: message,
      },
    });
    return true;
  }
  throw new OperationalException(404, false, "Product not found");
};

export const countProducts = async (categoryId, status, startDate, endDate) => {
  const validStatus = status
    ? Object.values(Status).includes(status.toUpperCase())
      ? status.toUpperCase()
      : null
    : null;
  const validCategoryId = [1, 2].includes(parseInt(categoryId))
    ? parseInt(categoryId)
    : {};

  const whereClause = {
    ...(validStatus ? { status: validStatus } : {}),
    ...(validCategoryId ? { categoryId: validCategoryId } : {}),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        }
      : {}),
  };
  return await prismaClient.product.count({
    where: Object.keys(whereClause).length > 0 ? whereClause : {},
  });
};
