import { prismaClient } from "../routes/index.js";

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
