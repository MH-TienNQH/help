import { prismaClient } from "../routes/index.js";

export const deleteSoldProduct = async (req, res, next) => {
  try {
    const now = new Date();

    const oneWeekAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7);

    await prismaClient.product.deleteMany({
      where: {
        soldAt: {
          lt: oneWeekAgo.toISOString(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
