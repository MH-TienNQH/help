import { prismaClient } from "../routes/index.js";

export const deleteNotVerified = async () => {
  const now = new Date();

  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

  await prismaClient.user.deleteMany({
    where: {
      verified: true,
      createdAt: {
        lt: fifteenMinutesAgo.toISOString(),
      },
    },
  });
};
