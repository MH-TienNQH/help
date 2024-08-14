import { prismaClient } from "../routes/index.js";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import { responseFormat } from "../utils/responseFormat.js";
import * as userServices from "./userServices.js";
import { Status } from "@prisma/client";

export const getAllProduct = async () => {
  let products = await prismaClient.product.findMany();

  return products;
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
  throw new OperationalException("No product found", 404);
};
export const addProduct = async (data, images, userId) => {
  let product = await prismaClient.product.findFirst({
    where: {
      name: data.name,
    },
  });
  if (product) {
    return new responseFormat(403, false, "Product exist");
  }
  product = await prismaClient.product.create({
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
  return new responseFormat(200, true, [product.name, "product created"]);
};

export const updateProduct = async (productId, data, userId, images) => {
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
      images: JSON.stringify(images),
      price: parseInt(data.price),
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
  let numberOfProducts = await prismaClient.product.count({
    where: {
      name: {
        contains: productName || "", // Search for products where the name contains the specified value
      },
      ...(categoryId ? { categoryId: parseInt(categoryId) } : {}),
      ...(validStatus ? { status: validStatus } : {}),
    },
  });

  let products = await prismaClient.product.findMany({
    where: {
      name: {
        contains: productName || "", // Search for products where the name contains the specified value
      },
      ...(categoryId ? { categoryId: parseInt(categoryId) } : {}),
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
      privious_page: previousPage,
      current_page: page,
      next_page: nextPage,
      total: totalPages,
    },
  };
};

export const approveProduct = async (productId) => {
  await prismaClient.product.update({
    where: {
      productId: parseInt(productId),
    },
    data: {
      status: "APPROVED",
      statusMessage: "Your product have been approved",
    },
  });
  return new responseFormat(200, true, "product approved");
};

export const rejectProduct = async (productId, message) => {
  if (message == "") {
    return new responseFormat(404, false, "Please enter reason for rejection");
  }
  await prismaClient.product.update({
    where: {
      productId,
    },
    data: {
      status: "REJECTED",
      statusMessage: message,
    },
  });
  return new responseFormat(200, true, "product rejected");
};

export const getImageUrl = async (filename) => {
  const __dirname = "./public";
  const filePath = path.resolve(__dirname, "images", filename);

  return filePath;
};
