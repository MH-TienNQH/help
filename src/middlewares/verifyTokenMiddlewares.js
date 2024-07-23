import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const verifyTokenMiddlewares = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(403).send("not authenticated");
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
