import { OperationalException } from "../exceptions/operationalExceptions.js";
import { prismaClient } from "../routes/index.js";

const checkVerifyStatusMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await prismaClient.user.findUnique({
      where: {
        userId,
      },
    });
    if (user.verified === false) {
      throw new OperationalException(403, false, "Verify your account first");
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default checkVerifyStatusMiddleware;
