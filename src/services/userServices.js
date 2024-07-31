import { hashSync } from "bcrypt";
import { prismaClient } from "../routes/index.js";

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

export const addUser = async (data) => {
  data.password = hashSync(data.password, 10);
  return await prismaClient.user.create({
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
      avatar: data.avatar,
      role: data.role,
    },
  });
};

export const updateUser = async (id, data) => {
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
      avatar: data.avatar,
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
