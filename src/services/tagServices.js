import { OperationalException } from "../exceptions/operationalExceptions.js";
import { prismaClient } from "../routes/index.js";
import { io } from "../socket.io/server.js";
import { convertVietnamTimeToUtc } from "../utils/changeToVietnamTimezone.js";

const vietnamDate = new Date();
const utcDate = convertVietnamTimeToUtc(vietnamDate);
export const getUsers = async (name, page, limit) => {
  const skip = (page - 1) * limit;
  const numberOfUsers = await prismaClient.user.count({
    where: {
      username: {
        contains: name || "",
      },
    },
  });
  const users = await prismaClient.user.findMany({
    where: {
      username: {
        contains: name || "",
      },
    },
    select: {
      userId: true,
      username: true,
    },
    skip,
    take: limit,
  });
  const totalPages = Math.ceil(numberOfUsers / limit);
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  return {
    users: users.length > 0 ? users : "no users",
    meta: {
      previous_page: previousPage,
      current_page: page,
      next_page: nextPage,
      total: totalPages,
    },
  };
};

export const tagUser = async (data, taggerId) => {
  if (taggerId === parseInt(data.taggedId)) {
    throw new OperationalException(403, false, "You can not tag yourself");
  }
  const product = await prismaClient.product.findUnique({
    where: {
      productId: parseInt(data.productId),
    },
  });
  if (!product) {
    throw new OperationalException(404, false, "Product not found");
  }
  const tagger = await prismaClient.user.findUnique({
    where: {
      userId: taggerId,
    },
  });
  const tag = await prismaClient.tag.create({
    data: {
      productId: parseInt(data.productId),
      taggerUserId: taggerId,
      taggedUserId: parseInt(data.taggedId),
    },
  });
  io.emit(`notification ${parseInt(data.taggedId)}`, {
    product: product,
    tagger: tagger,
    message: `${tagger.name} đã nhắc đến bạn trong một sản phẩm`,
  });
  await prismaClient.notification.create({
    data: {
      content: `${tagger.name} đã nhắc đến bạn trong một sản phẩm`,
      user: {
        connect: {
          userId: parseInt(data.taggedId),
        },
      },
      product: {
        connect: {
          productId: parseInt(data.productId),
        },
      },
      createdAt: utcDate,
    },
  });
  return tag;
};
