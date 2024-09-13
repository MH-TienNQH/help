import {
  AccountOperationalErrorsConstants,
  AuthOperationalErrorConstants,
  CommentOperationalErrorConstant,
  ProductOperationalErrorConstants,
} from "../constants/constants.js";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import { prismaClient } from "../routes/index.js";
import { io } from "../socket.io/server.js";
import { formatVietnamTime } from "../utils/changeToVietnamTimezone.js";
import { extractTaggedUserIds } from "../utils/extractUserId.js";

const vietnamDate = new Date();

const formatCommentContent = (content, taggedUsers) => {
  return content.replace(/@(\d+)/g, (match, userId) => {
    const user = taggedUsers.find((u) => u.userId === parseInt(userId, 10));
    return user ? `@${user.name}` : match;
  });
};
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
  const taggedUserIds = comments.flatMap((comment) =>
    extractTaggedUserIds(comment.content)
  );
  const taggedUsers = await prismaClient.user.findMany({
    where: { userId: { in: taggedUserIds } },
  });

  const totalPages = Math.ceil(numberOfComments / limit);
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  const formattedComments = comments.map((comment) => ({
    ...comment,
    createdAt: formatVietnamTime(comment.createdAt),
    content: formatCommentContent(comment.content, taggedUsers),
  }));
  return {
    comments: formattedComments,
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
    throw new OperationalException(
      404,
      false,
      ProductOperationalErrorConstants.PRODUCT_NOT_FOUND_ERROR
    );
  }
  const user = await prismaClient.user.findUnique({
    where: {
      userId,
    },
  });
  if (!user) {
    throw new OperationalException(
      404,
      false,
      AccountOperationalErrorsConstants.ACCOUNT_NOT_FOUND_ERROR
    );
  }
  const taggedUserIds = extractTaggedUserIds(data.content);
  const taggedUsers = await prismaClient.user.findMany({
    where: {
      userId: { in: taggedUserIds },
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
      createdAt: new Date(),
    },
  });
  io.emit(`comment ${productId}`, {
    product,
    user,
    message: `${user.username} đã bình luận vào sản phẩm của bạn`,
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
        createdAt: new Date(),
      },
    });
  }
  for (const taggedUser of taggedUsers) {
    io.emit(`notification ${taggedUser.userId}`, {
      product,
      user,
      message: `${user.username} đã nhắc đến bạn trong một bình luận: ${comment.content}`,
    });
    const notification = await prismaClient.notification.create({
      data: {
        content: `${user.username} đã nhắc đến bạn trong một bình luận: ${comment.content}`,
        user: { connect: { userId: taggedUser.userId } },
        product: { connect: { productId: product.productId } },
        createdAt: new Date(),
      },
    });
  }
  return {
    ...comment,
    createdAt: formatVietnamTime(comment.createdAt),
  };
};

export const updateComment = async (commentId, userId, data) => {
  let comment = await prismaClient.comment.findUnique({
    where: {
      commentId: parseInt(commentId),
    },
  });
  if (!comment) {
    throw new OperationalException(
      404,
      false,
      CommentOperationalErrorConstant.COMMENT_NOT_FOUND
    );
  }
  if (comment.userId !== userId) {
    throw new OperationalException(
      403,
      false,
      AuthOperationalErrorConstants.NOT_AUTHORIZED_ERROR
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
    throw new OperationalException(
      404,
      false,
      CommentOperationalErrorConstant.COMMENT_NOT_FOUND
    );
  }
  if (comment.userId !== userId) {
    throw new OperationalException(
      403,
      false,
      AuthOperationalErrorConstants.NOT_AUTHORIZED_ERROR
    );
  }
  await prismaClient.comment.delete({
    where: {
      commentId: parseInt(commentId),
    },
  });
  return true;
};
