import { prismaClient } from "../routes/index.js";

export const deleteNotVerified = async (req, res, next) => {
  try {
    const now = new Date();

    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    await prismaClient.user.deleteMany({
      where: {
        verified: false,
        createdAt: {
          lt: fifteenMinutesAgo.toISOString(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
