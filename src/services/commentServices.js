import { OperationalException } from "../exceptions/operationalExceptions.js";
import { prismaClient } from "../routes/index.js";
import { io } from "../socket.io/server.js";
import { convertVietnamTimeToUtc } from "../utils/changeToVietnamTimezone.js";

const vietnamDate = new Date();
const utcDate = convertVietnamTimeToUtc(vietnamDate);

export const getComments = async (productId, order = "desc", page, limit) => {
  const orderDirection = ["asc", "desc"].includes(order.toLowerCase())
    ? order.toLowerCase()
    : "desc";
  const skip = (page - 1) * limit;

  let numberOfComments = await prismaClient.comment.count({
    where: {
      productId: parseInt(productId),
    },
  });
  let comments = await prismaClient.comment.findMany({
    where: {
      productId: parseInt(productId),
    },
    include: {
      user: true,
    },
    orderBy: {
      commentId: orderDirection,
    },
    skip,
    take: limit,
  });
  const totalPages = Math.ceil(numberOfComments / limit);
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  return {
    comments,
    meta: {
      privious_page: previousPage,
      current_page: page,
      next_page: nextPage,
      total: totalPages,
    },
  };
};

export const addComment = async (productId, userId, data) => {
  const product = await prismaClient.product.findUnique({
    where: {
      productId,
    },
  });
  if (!product) {
    throw new OperationalException(404, false, "Product not found");
  }
  const user = await prismaClient.user.findUnique({
    where: {
      userId,
    },
  });
  const comment = await prismaClient.comment.create({
    data: {
      content: data.content,
      user: {
        connect: {
          userId,
        },
      },
      product: {
        connect: {
          productId,
        },
      },
    },
  });
  io.emit(`comment ${productId}`, {
    product,
    user,
    message: `${user.username} has commented on your product`,
    content: comment.content,
  });
  if (product.userId && product.userId !== userId) {
    io.emit(`notification ${product.userId}`, {
      product,
      user,
      message: `${user.username} đã bình luận vào sản phẩm của bạn`,
    });
    await prismaClient.notification.create({
      data: {
        content: `${user.username} đã bình luận vào sản phẩm của bạn`,
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
        createdAt: utcDate,
      },
    });
  }
  return comment;
};

export const updateComment = async (commentId, userId, data) => {
  let comment = await prismaClient.comment.findUnique({
    where: {
      commentId: parseInt(commentId),
    },
  });
  if (!comment) {
    throw new OperationalException(404, false, "Comment not found");
  }
  if (comment.userId !== userId) {
    throw new OperationalException(
      403,
      false,
      "You are not authorized to update this comment"
    );
  }
  await prismaClient.comment.update({
    where: {
      commentId: parseInt(commentId),
    },
    data: {
      content: data.content,
      user: {
        connect: {
          userId: userId,
        },
      },
    },
  });
  return true;
};

export const deleteComment = async (commentId, userId) => {
  let comment = await prismaClient.comment.findUnique({
    where: {
      commentId: parseInt(commentId),
    },
  });
  if (!comment) {
    throw new OperationalException(404, false, "Comment not found");
  }
  if (comment.userId !== userId) {
    throw new OperationalException(
      403,
      false,
      "You are not authorized to delete this comment"
    );
  }
  await prismaClient.comment.delete({
    where: {
      commentId: parseInt(commentId),
    },
  });
  return true;
};
