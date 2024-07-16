import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { prismaClient } from "../routes/index.js";
import { error } from "console";

dotenv.config();
const verifyTokenMiddlewares = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).send("not authenticated");
  }

  jwt.verify(accessToken, process.env.JWT_KEY, async (err, payload) => {
    if (err) {
      return res.status(403).send("access token not valid");
    }
    req.userId = payload.userId;
    req.userRole = payload.userRole;
    res.send("authenticated");
    next();
  });
};
export default verifyTokenMiddlewares;
