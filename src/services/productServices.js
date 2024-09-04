import { Status } from "@prisma/client";

import { prismaClient } from "../routes/index.js";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import * as userServices from "./userServices.js";

import { adminSockets, io } from "../socket.io/server.js";
import { convertVietnamTimeToUtc } from "../utils/changeToVietnamTimezone.js";
import { roleConstants, statusConstants } from "../constants/constants.js";

const vietnamDate = new Date(); // Current local time
const utcDate = convertVietnamTimeToUtc(vietnamDate);
export const getAllProduct = async () => {
  const products = await prismaClient.product.findMany({
    include: {
      author: true,
    },
  });
  const formattedProducts = products.map((product) => ({
    ...product,
    createdAt: formatVietnamTime(product.createdAt),
  }));
  return formattedProducts;
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
export const addProduct = async (data, images, userId, userRole) => {
  const isExist = await prismaClient.product.findUnique({
    where: {
      name: data.name,
    },
  });
  if (isExist) {
    throw new OperationalException(403, false, "Product exist");
  }
  const product = await prismaClient.product.create({
    data: {
      name: data.name,
      description: data.description,
      images: JSON.stringify(images),
      price: parseInt(data.price),
      status:
        userRole === roleConstants[1] ? statusConstants[2] : statusConstants[1],
      author: {
        connect: {
          userId: userId,
        },
      },
      createdAt: new Date(),
    },
    include: {
      author: true,
    },
  });
  adminSockets.forEach((socketId) => {
    io.to(socketId).emit("productAdded", {
      product: product,
      user: product.author,
    });
  });
  const adminUsers = await prismaClient.user.findMany({
    where: {
      role: "ADMIN",
    },
    select: {
      userId: true,
    },
  });

  const adminUserIds = adminUsers.map((user) => user.userId);
  await Promise.all(
    adminUserIds.map((adminUserId) =>
      prismaClient.notification.create({
        data: {
          content: `${product.author.name} đã tạo một sản phẩm`,
          user: {
            connect: { userId: adminUserId },
          },
          product: {
            connect: { productId: product.productId },
          },
          createdAt: utcDate, // Use current date-time
        },
      })
    )
  );
  return product;
};

export const updateProduct = async (
  productId,
  data,
  userId,
  userRole,
  images
) => {
  const isExist = await prismaClient.product.findUnique({
    where: {
      productId: parseInt(productId),
    },
  });
  if (!isExist) {
    throw new OperationalException(404, false, "Product not found");
  }
  if (isExist.userId !== userId && userRole !== roleConstants[1]) {
    throw new OperationalException(
      403,
      false,
      "You are not authorized to update this product"
    );
  }

  const existingUserWithProductname = await prismaClient.product.findUnique({
    where: {
      name: data.name,
    },
  });

  if (
    existingUserWithProductname &&
    existingUserWithProductname.userId !== userId
  ) {
    throw new OperationalException(400, false, "Username already exists");
  }

  if (!images.length || images == "") {
    images = JSON.parse(isExist.images); // Convert from JSON string to object
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
  if (product.userId !== userId && userRole !== roleConstants[1]) {
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

export const getThreeTrendingProduct = async (startDate, endDate) => {
  const whereClause = {
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        }
      : {}),
  };
  return await prismaClient.product.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : {},
    include: {
      RequestToBuy: {
        include: {
          user: true,
        },
      },
      author: true,
      _count: {
        select: {
          RequestToBuy: true,
        },
      },
    },
    orderBy: {
      RequestToBuy: {
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
      : "APPROVED"
    : "APPROVED";

  const orderDirection = ["asc", "desc"].includes(order.toLowerCase())
    ? order.toLowerCase()
    : "desc";
  const validCategoryId = [1, 2].includes(parseInt(categoryId))
    ? parseInt(categoryId)
    : null;
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

export const approveProduct = async (productId, userId) => {
  const isExist = await prismaClient.product.findUnique({
    where: {
      productId,
    },
    include: {
      author: true,
    },
  });
  if (isExist) {
    await prismaClient.product.update({
      where: {
        productId,
      },
      data: {
        status: statusConstants[2],
        statusMessage: "Sản phẩm bạn đăng lên đã được chấp thuận",
      },
    });
    if (isExist.userId && isExist.userId !== userId) {
      io.emit(`notification ${isExist.userId}`, {
        product: isExist,
        user: isExist.author,
        message: `Sản phẩm ${isExist.name} bạn đăng lên đã được chấp thuận`,
      });
    }
    await prismaClient.notification.create({
      data: {
        content: `Sản phẩm ${isExist.name}  bạn đăng lên đã được chấp thuận`,
        user: {
          connect: {
            userId: isExist.userId,
          },
        },
        product: {
          connect: {
            productId: isExist.productId,
          },
        },
        createdAt: utcDate,
      },
    });
    return true;
  }
  throw new OperationalException(404, false, "Product not found");
};

export const rejectProduct = async (userId, productId, message) => {
  const isExist = await prismaClient.product.findUnique({
    where: {
      productId,
    },
    include: {
      author: true,
    },
  });
  if (isExist) {
    await prismaClient.product.update({
      where: {
        productId,
      },
      data: {
        status: statusConstants[3],
        statusMessage: message,
      },
    });

    if (isExist.userId && isExist.userId !== userId) {
      io.emit(`notification ${isExist.userId}`, {
        product: isExist,
        user: isExist.author,
        message: `Sản phẩm ${isExist.name} bạn đăng lên đã bị từ chối`,
      });
      await prismaClient.notification.create({
        data: {
          content: `Sản phẩm ${isExist.name} bạn đăng lên đã bị từ chối`,
          user: {
            connect: {
              userId: isExist.userId,
            },
          },
          product: {
            connect: {
              productId: isExist.productId,
            },
          },
          createdAt: utcDate,
        },
      });
    }
    return true;
  }
  throw new OperationalException(404, false, "Product not found");
};

export const getProductsForChart = async (
  categoryId,
  status,
  startDate,
  endDate
) => {
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
  return await prismaClient.product.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : {},
  });
};
