import { compareSync, hashSync } from "bcrypt";
import { prismaClient } from "../routes/index.js";

import { OperationalException } from "../exceptions/operationalExceptions.js";
import {
  responseFormat,
  responseFormatForErrors,
} from "../utils/responseFormat.js";

import { getThreeTrendingProduct } from "./productServices.js";
import { io } from "../socket.io/server.js";

import { RequestStatus, Role, Status } from "@prisma/client";

export const getAllUser = async (name, order = "asc", role, page, limit) => {
  const skip = (page - 1) * limit;
  const orderDirection = ["asc", "desc"].includes(order.toLowerCase())
    ? order.toLowerCase()
    : "asc";
  const validRole = role
    ? Object.values(Role).includes(role.toUpperCase())
      ? role.toUpperCase()
      : null
    : null;
  let numberOfUsers = await prismaClient.user.count({
    where: {
      name: {
        contains: name || "",
      },
      ...(validRole ? { role: validRole } : {}),
    },
  });
  const users = await prismaClient.user.findMany({
    where: {
      name: {
        contains: name || "",
      },
      ...(validRole ? { role: validRole } : {}),
    },
    take: limit,
    skip: skip,
    orderBy: {
      createdAt: orderDirection,
    },
  });
  const usersWithImageUrls = users.map((user) => ({
    ...user,
    imageUrl: `${process.env.BASE_URL}/${user.avatar}`, // Construct the full image URL
  }));
  const totalPages = Math.ceil(numberOfUsers / limit);
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  return {
    usersWithImageUrls,
    meta: {
      previous_page: previousPage,
      current_page: page,
      next_page: nextPage,
      total: totalPages,
    },
  };
};

export const findById = async (id) => {
  const user = await prismaClient.user.findUnique({
    where: {
      userId: id,
    },
  });
  if (user) {
    return {
      ...user,
      imageUrl: `${process.env.BASE_URL}/${user.avatar}`, // Construct the full image URL
    };
  }
};

export const findUserByEmail = async (email) => {
  return await prismaClient.user.findUnique({
    where: {
      email,
    },
  });
};

export const addUser = async (data, avatar) => {
  const existingUserWithUsername = await prismaClient.user.findUnique({
    where: {
      username: data.username,
    },
  });

  const existingUserWithEmail = await prismaClient.user.findUnique({
    where: {
      email: data.email,
    },
  });
  if (existingUserWithUsername) {
    throw new OperationalException(400, false, "Username already exists");
  }
  if (existingUserWithEmail) {
    throw new OperationalException(400, false, "Email already exists");
  }
  data.password = hashSync(data.password, 10);
  return await prismaClient.user.create({
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
      avatar: JSON.stringify(avatar),
      role: data.role,
    },
  });
};

export const updateUser = async (id, userId, userRole, data, avatar) => {
  let user = await prismaClient.user.findUnique({
    where: {
      userId: id,
    },
  });
  if (user.userId !== userId && userRole !== "ADMIN") {
    return new responseFormatForErrors(
      401,
      false,
      "You are not authorized to update this account"
    );
  }

  const existingUserWithUsername = await prismaClient.user.findUnique({
    where: {
      username: data.username,
    },
  });

  const existingUserWithEmail = await prismaClient.user.findUnique({
    where: {
      email: data.email,
    },
  });
  if (existingUserWithUsername && existingUserWithUsername.userId !== id) {
    throw new OperationalException(400, false, "Username already exists");
  }
  if (existingUserWithEmail && existingUserWithEmail.userId !== id) {
    throw new OperationalException(400, false, "Email already exists");
  }

  let hashedPassword;
  if (data.password == user.password) {
    hashedPassword = user.password;
  } else {
    hashedPassword = hashSync(data.password, 10);
  }

  const finalAvatar = avatar == "" ? user.avatar : JSON.stringify(avatar);
  return await prismaClient.user.update({
    where: {
      userId: id,
    },
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
      password: hashedPassword,
      avatar: finalAvatar,
      role: data.role,
    },
  });
};

export const deleteUser = async (id, userId, userRole) => {
  const userExist = await prismaClient.user.findUnique({
    where: {
      userId: id,
    },
  });
  if (!userExist) {
    throw new OperationalException(404, false, "User not found");
  }
  if (userExist.userId !== userId && userRole !== "ADMIN") {
    throw new OperationalException(
      401,
      false,
      "You are not authorized to delete this account"
    );
  }
  await prismaClient.user.delete({
    where: {
      userId: id,
    },
  });
  return true;
};

export const saveProduct = async (userId, productId) => {
  const savedProduct = await prismaClient.productSaved.findUnique({
    where: {
      productId_userId: {
        userId: userId,
        productId: productId,
      },
    },
  });
  if (savedProduct) {
    await prismaClient.productSaved.delete({
      where: {
        productId_userId: {
          userId,
          productId,
        },
      },
    });
    return new responseFormat(200, true, "unsaved product");
  } else {
    await prismaClient.productSaved.create({
      data: {
        userId,
        productId,
      },
    });
    return new responseFormat(200, true, "saved product");
  }
};

export const likeProduct = async (userId, productId) => {
  const product = await prismaClient.product.findUnique({
    where: {
      productId,
    },
  });
  const user = await prismaClient.user.findUnique({
    where: {
      userId,
    },
  });
  if (!product) {
    throw new OperationalException(404, false, "Product not found");
  }
  const likedProduct = await prismaClient.productLiked.findUnique({
    where: {
      productId_userId: {
        userId,
        productId,
      },
    },
  });

  if (likedProduct) {
    await prismaClient.productLiked.delete({
      where: {
        productId_userId: {
          userId,
          productId,
        },
      },
    });
    await prismaClient.notification.delete({
      where: {
        userId: product.userId,
      },
    });
    return true;
  } else {
    await prismaClient.productLiked.create({
      data: {
        userId,
        productId,
      },
    });
    if (product.userId && product.userId !== userId) {
      io.emit("like", {
        userId,
        productId,
        message: `${user.name} đã thích sản phẩm của bạn`,
      });
    }
    await prismaClient.notification.create({
      data: {
        content: `${user.name} đã thích sản phẩm của bạn`,
        user: {
          connect: {
            userId: product.userId,
          },
        },
        product: {
          connect: {
            productId: product.productId,
          },
        },
      },
    });
  }
  return true;
};

export const requestToBuyProduct = async (
  userId,
  productId,
  message,
  offer
) => {
  const product = await prismaClient.product.findUnique({
    where: {
      productId,
    },
  });
  const user = await prismaClient.user.findUnique({
    where: {
      userId,
    },
  });
  if (product) {
    const requestToBuy = await prismaClient.requestToBuy.findUnique({
      where: {
        productId_userId: {
          userId,
          productId,
        },
      },
      include: {
        product: true,
        user: true,
      },
    });
    if (requestToBuy) {
      await prismaClient.requestToBuy.delete({
        where: {
          productId_userId: {
            userId,
            productId,
          },
        },
      });
      const notification = await prismaClient.notification.findFirst({
        where: {
          userId: product.userId,
        },
      });
      await prismaClient.notification.delete({
        where: {
          notificationId: notification.notificationId,
        },
      });
      return true;
    } else {
      await prismaClient.requestToBuy.create({
        data: {
          userId,
          productId,
          message,
          offer,
        },
      });
      // Emit the notification only to the product owner}
      if (product.userId && product.userId !== userId) {
        io.emit(`notification ${product.userId}`, {
          product,
          user,
          message: `${user.username} đã gửi yêu cầu mua sản phẩm ${product.name} của bạn`,
        });
      }
      await prismaClient.notification.create({
        data: {
          content: `${user.username} đã gửi yêu cầu mua sản phẩm ${product.name} của bạn`,
          user: {
            connect: {
              userId: product.userId,
            },
          },
          product: {
            connect: {
              productId: product.productId,
            },
          },
        },
      });
    }
    return true;
  }
  throw new OperationalException(404, false, "Product not found");
};

export const getListOfRequesterForOneProduct = async (productId) => {
  const product = await prismaClient.product.findUnique({
    where: {
      productId,
    },
  });
  if (!product) {
    return new responseFormat(404, false, { mmessage: "product not found" });
  }
  const requests = await prismaClient.requestToBuy.findMany({
    where: {
      productId,
    },
    include: {
      user: true,
    },
  });

  return new responseFormat(200, true, requests);
};
export const personalProduct = async (
  userId,
  order = "desc",
  categoryId,
  status,
  requestStatus,
  page,
  limit
) => {
  const skip = (page - 1) * limit;
  const validStatus = status
    ? Object.values(Status).includes(status.toUpperCase())
      ? status.toUpperCase()
      : null
    : null;
  const validRequestStatus = requestStatus
    ? Object.values(RequestStatus).includes(requestStatus.toUpperCase())
      ? requestStatus.toUpperCase()
      : null
    : null;
  const orderDirection = ["asc", "desc"].includes(order.toLowerCase())
    ? order.toLowerCase()
    : "desc";
  const validCategoryId = [1, 2].includes(parseInt(categoryId))
    ? parseInt(categoryId)
    : 1;

  const numberOfProducts = await prismaClient.product.count({
    where: {
      userId,
      ...(validCategoryId ? { categoryId: validCategoryId } : {}),
      ...(validStatus ? { status: validStatus } : {}),
    },
  });
  const userProduct = await prismaClient.product.findMany({
    where: {
      userId,
      ...(validCategoryId ? { categoryId: validCategoryId } : {}),
      ...(validStatus ? { status: validStatus } : {}),
    },
    orderBy: {
      productId: orderDirection,
    },
    skip,
    take: limit,
  });
  const numberOfSavedProducts = await prismaClient.productSaved.count({
    where: {
      userId,
    },
  });
  const saved = await prismaClient.productSaved.findMany({
    where: {
      userId,
    },
    include: {
      product: {
        include: {
          author: true,
        },
      },
    },
    orderBy: {
      productId: orderDirection,
    },
  });
  const numberOfRequestedProducts = await prismaClient.requestToBuy.count({
    where: {
      userId,
      ...(validRequestStatus ? { requestStatus: validRequestStatus } : {}),
    },
  });
  const requested = await prismaClient.requestToBuy.findMany({
    where: {
      userId,
      ...(validRequestStatus ? { requestStatus: validRequestStatus } : {}),
    },
    include: {
      product: {
        include: {
          author: true,
        },
      },
    },
    orderBy: {
      productId: orderDirection,
    },
  });
  const savedProducts = saved.map((item) => item.product);
  const totalPages = Math.ceil(numberOfProducts / limit);
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  const totalPagesSaved = Math.ceil(numberOfSavedProducts / limit);
  const nextPageSaved = page < totalPagesSaved ? page + 1 : null;
  const previousPageSaved = page > 1 ? page - 1 : null;

  const totalPagesRequested = Math.ceil(numberOfRequestedProducts / limit);
  const nextPageRequested = page < totalPagesRequested ? page + 1 : null;
  const previousPageRequested = page > 1 ? page - 1 : null;
  return {
    userProducts: {
      data: userProduct,
      meta: {
        previous_page: previousPage,
        current_page: page,
        next_page: nextPage,
        total: totalPages,
      },
    },
    savedProducts: {
      data: savedProducts,
      meta: {
        previous_page: previousPageSaved,
        current_page: page,
        next_page: nextPageSaved,
        total: totalPagesSaved,
      },
    },
    requestedProducts: {
      data: requested,
      meta: {
        previous_page: previousPageRequested,
        current_page: page,
        next_page: nextPageRequested,
        total: totalPagesRequested,
      },
    },
  };
};

export const approveRequest = async (ownerId, productId, userId) => {
  let product = await prismaClient.requestToBuy.findUnique({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
    include: {
      product: true,
    },
  });
  if (!product) {
    return new responseFormat(404, false, {
      message: "request not found",
    });
  }
  if (product.product.userId !== ownerId) {
    return new responseFormat(401, false, {
      message: "you are not the owner",
    });
  }
  await prismaClient.requestToBuy.update({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
    data: {
      requestStatus: "APPROVED",
    },
  });
  await prismaClient.requestToBuy.updateMany({
    where: {
      productId,
      NOT: {
        userId,
      },
    },
    data: {
      requestStatus: "REJECTED",
    },
  });

  await prismaClient.product.update({
    where: {
      productId,
    },
    data: {
      categoryId: 2,
    },
  });

  if (product.product.userId && product.product.userId !== userId) {
    io.emit(`notification ${product.product.userId}`, {
      product,
      user,
      message: `Yêu cầu mua sản phẩm ${product.product.name} của bạn đã được chấp nhận`,
    });
    await prismaClient.notification.create({
      data: {
        content: `Yêu cầu mua sản phẩm ${product.product.name} của bạn đã được chấp nhận`,
        user: {
          connect: {
            userId: userId,
          },
        },
        product: {
          connect: {
            productId: product.product.productId,
          },
        },
      },
    });
  }

  return true;
};
export const rejectRequest = async (ownerId, productId, userId) => {
  let product = await prismaClient.requestToBuy.findUnique({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
    include: {
      product: true,
    },
  });
  if (!product) {
    return new responseFormatForErrors(404, false, {
      message: "request not found",
    });
  }
  if (product.product.userId !== ownerId) {
    return new responseFormatForErrors(401, false, {
      message: "you are not the owner",
    });
  }
  await prismaClient.requestToBuy.update({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
    data: {
      requestStatus: "REJECTED",
    },
  });
  if (product.product.userId && product.product.userId !== userId) {
    io.emit(`notification ${product.product.userId}`, {
      product,
      user,
      message: `Yêu cầu mua sản phẩm ${product.product.name} của bạn đã bị từ chối`,
    });
    await prismaClient.notification.create({
      data: {
        content: `Yêu cầu mua sản phẩm ${product.product.name} của bạn đã bị từ chối`,
        user: {
          connect: {
            userId: userId,
          },
        },
        product: {
          connect: {
            productId: product.product.productId,
          },
        },
      },
    });
  }
  return true;
};
export const getUsersForChart = async (startDate, endDate) => {
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
  const users = await prismaClient.user.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : {},
  });
  return users;
};

export const createChartForTrending = async (startDate, endDate) => {
  const trendingProducts = await getThreeTrendingProduct(startDate, endDate);
  const trending = trendingProducts.map((product) => ({
    label: product.name,
    value: product._count.RequestToBuy,
  }));
  return trending;
};
