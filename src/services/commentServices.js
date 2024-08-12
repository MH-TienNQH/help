import { OperationalException } from "../exceptions/operationalExceptions.js";
import { prismaClient } from "../routes/index.js";
import { responseFormat } from "../utils/responseFormat.js";

export const getComments = async (productId, order, page, limit) => {
  const orderDirection = order === "asc" || order === "desc" ? order : "desc";
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
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
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
  return new responseFormat(200, true, comment);
};

export const updateComment = async (commentId, userId, data) => {
  let comment = await prismaClient.comment.findUnique({
    where: {
      commentId: parseInt(commentId),
    },
  });
  if (!comment) {
    throw new OperationalException("Comment not found", 404);
  }
  if (comment.userId !== userId) {
    throw new OperationalException(
      "You are not authorized to update this comment",
      403
    );
  }
  comment = await prismaClient.comment.update({
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
  return new responseFormat(200, true, comment);
};

export const deleteComment = async (commentId, userId) => {
  let comment = await prismaClient.comment.findUnique({
    where: {
      commentId: parseInt(commentId),
    },
  });
  if (!comment) {
    throw new OperationalException("Comment not found", 404);
  }
  if (comment.userId !== userId) {
    throw new OperationalException(
      "You are not authorized to delete this comment",
      403
    );
  }
  await prismaClient.comment.delete({
    where: {
      commentId: parseInt(commentId),
    },
  });
  return new responseFormat(200, true, "comment deleted");
};
