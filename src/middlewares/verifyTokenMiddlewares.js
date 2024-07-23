import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { OperationalException } from "../exceptions/operationalExceptions.js";

const verifyTokenMiddlewares = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    const error = new OperationalException("You are not authenticated", 401);
    next(error);
  }

  jwt.verify(accessToken, process.env.JWT_KEY, async (error, payload) => {
    if (error) {
      next(error);
    }
    req.userId = payload.userId;
    req.userRole = payload.userRole;
    next();
  });
};
export default verifyTokenMiddlewares;
