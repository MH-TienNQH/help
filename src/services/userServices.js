import { hashSync } from "bcrypt";
import { prismaClient } from "../routes/index.js";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import { responseFormat } from "../utils/responseFormat.js";
import { RequestStatus, Status } from "@prisma/client";

export const getAllUser = async () => {
  const users = await prismaClient.user.findMany();
  const usersWithImageUrls = users.map((user) => ({
    ...user,
    imageUrl: `${process.env.BASE_URL}/${user.avatar}`, // Construct the full image URL
  }));
  return usersWithImageUrls;
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
  let user = await prismaClient.user.findUnique({
    where: {
      username: data.username,
    },
  });
  if (user) {
    throw new OperationalException("Username already exist", 403);
  }
  data.password = hashSync(data.password, 10);
  user = await prismaClient.user.create({
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
      avatar: JSON.stringify(avatar),
      role: data.role,
    },
  });
  return user;
};

export const updateUser = async (id, data, avatar) => {
  data.password = hashSync(data.password, 10);
  return await prismaClient.user.update({
    where: {
      userId: id,
    },
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
      avatar,
      role: data.role,
    },
  });
};

export const deleteUser = async (id) => {
  return await prismaClient.user.delete({
    where: {
      userId: id,
    },
  });
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
    return new responseFormat(200, true, "unliked product");
  } else {
    await prismaClient.productLiked.create({
      data: {
        userId,
        productId,
      },
    });
    return new responseFormat(200, true, "liked product");
  }
};

export const requestToBuyProduct = async (
  userId,
  productId,
  message,
  offer
) => {
  const requestToBuy = await prismaClient.requestToBuy.findUnique({
    where: {
      productId_userId: {
        userId,
        productId,
      },
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
    return new responseFormat(200, true, "unrequested product");
  } else {
    await prismaClient.requestToBuy.create({
      data: {
        userId,
        productId,
        message,
        offer,
      },
    });
    return new responseFormat(200, true, "requested product");
  }
};

export const getListOfRequesterForOneProduct = async (productId) => {
  const product = await prismaClient.product.findUnique({
    where: {
      productId,
    },
  });
  if (!product) {
    return new responseFormat(404, false, "product not found");
  }
  const requests = await prismaClient.requestToBuy.findMany({
    where: {
      productId,
    },
    include: {
      user: true,
    },
  });
  const buyer = requests.map((item) => ({
    username: item.user.username,
    avatar: JSON.parse(item.user.avatar),
    message: item.message,
    offer: item.offer,
  }));

  return new responseFormat(200, true, buyer);
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
  let product = await prismaClient.requestToBuy.findFirst({
    where: {
      productId,
    },
    include: {
      product: true,
    },
  });
  if (product.product.userId !== ownerId) {
    return new responseFormat(401, false, "you are not the owner");
  }
  await prismaClient.requestToBuy.update({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
    data: {
      requestStatus: "APPROVE",
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
  await prismaClient.requestToBuy.updateMany({
    where: {
      productId,
      user: {
        userId: {
          not: userId,
        },
      },
    },
    data: {
      requestStatus: "REJECT",
    },
  });
  return new responseFormat(200, true, "request approved");
};
export const rejectRequest = async (ownerId, productId, userId) => {
  let product = await prismaClient.requestToBuy.findFirst({
    where: {
      productId,
    },
    include: {
      product: true,
    },
  });
  if (product.product.userId !== ownerId) {
    return new responseFormat(401, false, "you are not the owner");
  }
  await prismaClient.requestToBuy.update({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
    data: {
      requestStatus: "REJECT",
    },
  });
  return new responseFormat(200, true, "request rejected");
};
