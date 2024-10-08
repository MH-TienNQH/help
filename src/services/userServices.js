import { hashSync } from "bcrypt";
import { prismaClient } from "../routes/index.js";

import { OperationalException } from "../exceptions/operationalExceptions.js";
import {
  responseFormat,
  responseFormatForErrors,
} from "../utils/responseFormat.js";

import { getThreeTrendingProduct } from "./productServices.js";
import { io } from "../socket.io/server.js";
import { formatVietnamTime } from "../utils/changeToVietnamTimezone.js";

import { RequestStatus, Role, Status } from "@prisma/client";
import {
  AccountOperationalErrorsConstants,
  AuthOperationalErrorConstants,
  ProductOperationalErrorConstants,
  RequestOperationalErrorConstants,
  roleConstants,
  statusConstants,
} from "../constants/constants.js";
const vietnamDate = new Date();

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
  const formattedUser = users.map(({ password, ...user }) => ({
    ...user,
    createdAt: formatVietnamTime(user.createdAt),
  }));
  const totalPages = Math.ceil(numberOfUsers / limit);
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  return {
    formattedUser,
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
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      createdAt: formatVietnamTime(user.createdAt),
    };
  }
  throw new OperationalException(
    404,
    false,
    AccountOperationalErrorsConstants.ACCOUNT_NOT_FOUND_ERROR
  );
};

export const findUserByEmail = async (email) => {
  return await prismaClient.user.findUnique({
    where: {
      email,
    },
  });
};

export const addUser = async (data, avatar, userRole) => {
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
    throw new OperationalException(
      403,
      false,
      AccountOperationalErrorsConstants.USERNAME_EXIST_ERROR
    );
  }
  if (existingUserWithEmail) {
    throw new OperationalException(
      403,
      false,
      AccountOperationalErrorsConstants.EMAIL_EXIST_ERROR
    );
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
      verified: userRole === roleConstants[1] ? true : false,
      createdAt: new Date(),
    },
  });
};

export const updateUser = async (id, userId, userRole, data, avatar) => {
  let user = await prismaClient.user.findUnique({
    where: {
      userId: id,
    },
  });
  if (user.userId !== userId && userRole !== roleConstants[1]) {
    return new responseFormatForErrors(
      401,
      false,
      AuthOperationalErrorConstants.NOT_AUTHORIZED_ERROR
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
    throw new OperationalException(
      400,
      false,
      AccountOperationalErrorsConstants.USERNAME_EXIST_ERROR
    );
  }
  if (existingUserWithEmail && existingUserWithEmail.userId !== id) {
    throw new OperationalException(
      400,
      false,
      AccountOperationalErrorsConstants.EMAIL_EXIST_ERROR
    );
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
    throw new OperationalException(
      404,
      false,
      AccountOperationalErrorsConstants.ACCOUNT_NOT_FOUND_ERROR
    );
  }
  if (userExist.userId !== userId && userRole !== roleConstants[1]) {
    throw new OperationalException(
      401,
      false,
      AuthOperationalErrorConstants.NOT_AUTHORIZED_ERROR
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
    throw new OperationalException(
      404,
      false,
      ProductOperationalErrorConstants.PRODUCT_NOT_FOUND_ERROR
    );
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
        user,
        product,
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
        createdAt: new Date(),
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
          createdAt: new Date(),
        },
      });
    }
    return true;
  }
  throw new OperationalException(
    404,
    false,
    ProductOperationalErrorConstants.PRODUCT_NOT_FOUND_ERROR
  );
};

export const getListOfRequesterForOneProduct = async (productId) => {
  const product = await prismaClient.product.findUnique({
    where: {
      productId,
    },
  });
  if (!product) {
    return new responseFormat(404, false, {
      mmessage: ProductOperationalErrorConstants.PRODUCT_NOT_FOUND_ERROR,
    });
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
  const user = await prismaClient.user.findUnique({
    where: {
      userId,
    },
  });
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
      message: RequestOperationalErrorConstants.REQUEST_NOT_FOUND,
    });
  }
  if (product.product.userId !== ownerId) {
    return new responseFormat(401, false, {
      message: AuthOperationalErrorConstants.NOT_AUTHORIZED_ERROR,
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
      requestStatus: statusConstants[2],
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
      requestStatus: statusConstants[3],
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
    io.emit(`notification ${userId}`, {
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
        createdAt: new Date(),
      },
    });
  }

  return true;
};
export const rejectRequest = async (ownerId, productId, userId) => {
  const user = await prismaClient.user.findUnique({
    where: {
      userId,
    },
  });
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
      message: RequestOperationalErrorConstants.REQUEST_NOT_FOUND,
    });
  }
  if (product.product.userId !== ownerId) {
    return new responseFormatForErrors(401, false, {
      message: AuthOperationalErrorConstants.NOT_AUTHORIZED_ERROR,
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
      requestStatus: statusConstants[3],
    },
  });
  if (product.product.userId && product.product.userId !== userId) {
    io.emit(`notification ${userId}`, {
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
        createdAt: new Date(),
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
