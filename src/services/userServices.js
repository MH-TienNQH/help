import { hashSync } from "bcrypt";
import { prismaClient } from "../routes/index.js";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import { responseFormat } from "../utils/responseFormat.js";
import { sendMailTo } from "../utils/sendMail.js";

export const getAllUser = async () => {
  return await prismaClient.user.findMany();
};

export const findById = async (id) => {
  return await prismaClient.user.findUnique({
    where: {
      userId: id,
    },
  });
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
      avatar,
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
  } else {
    await prismaClient.productSaved.create({
      data: {
        userId,
        productId,
      },
    });
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
  } else {
    await prismaClient.productLiked.create({
      data: {
        userId,
        productId,
      },
    });
  }
};
export const verifyProduct = async (productId) => {
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
