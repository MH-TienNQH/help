import { prismaClient } from "../routes/index.js";

export const deleteOTP = async () => {
  const now = new Date();

  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

  await prismaClient.oTP.deleteMany({
    where: {
      createdAt: {
        lt: fifteenMinutesAgo.toISOString(),
      },
    },
  });
};
