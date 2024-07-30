import jwt from "jsonwebtoken";
import { OperationalException } from "../exceptions/operationalExceptions.js";

const verifyTokenMiddlewares = async (req, res, next) => {
  try {
    let accessToken = null;
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      accessToken = req.headers.authorization.split(" ")[1];
    }

    if (!accessToken) {
      const error = new OperationalException("You are not authenticated", 401);
      next(error);
    }

    jwt.verify(accessToken, process.env.JWT_KEY, async (error, payload) => {
      try {
        if (error) {
          next(error);
        }
        req.userId = payload.userId;
        req.userRole = payload.userRole;
        next();
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};
export default verifyTokenMiddlewares;
