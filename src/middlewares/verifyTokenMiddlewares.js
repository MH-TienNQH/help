import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { refresh } from "../controllers/authControllers.js";

dotenv.config();
const verifyTokenMiddlewares = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    refresh();
  }

  jwt.verify(accessToken, process.env.JWT_KEY, async (err, payload) => {
    if (err) {
      return res.status(403).send("access token not valid");
    }
    req.userId = payload.userId;
    req.userRole = payload.userRole;
    next();
  });
};
export default verifyTokenMiddlewares;
