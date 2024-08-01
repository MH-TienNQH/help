import { prismaClient } from "../routes/index.js";

export const expireOTP = async () => {
  const now = new Date();

  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

  await prismaClient.user.updateMany({
    where: {
      otpCreatedAt: {
        lt: fifteenMinutesAgo.toISOString(),
      },
    },
    data: {
      otp: null,
    },
  });
};
