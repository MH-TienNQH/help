import { compareSync, hashSync } from "bcrypt";
import { prismaClient } from "../routes/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { validationResult } from "express-validator";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";
import { sendMailTo } from "../utils/sendMail.js";
dotenv.config();

var deleteAfter15;

export const signUp = asyncErrorHandler(async (req, res, next) => {
  let result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send(result.array());
  }
  const { username, email, password, name, avatar } = req.body;
  let user = await prismaClient.user.findUnique({
    where: {
      username,
    },
  });
  if (user) {
    const error = new OperationalException("User already exist", 400);
    next(error);
  }
  user = await prismaClient.user.create({
    data: {
      name,
      username,
      email,
      password: hashSync(password, 10),
      avatar,
    },
  });
  try {
    sendMailTo(
      email,
      "Verify your email",
      `<p> Verify your email <a href = "${process.env.APP_URL}/api/auth/verify/${email}">here</a></p>`
    );
    console.log(`${process.env.APP_URL}/api/auth/verify/${email}"`);
    deleteAfter15 = setTimeout(async function () {
      await prismaClient.user.delete({
        where: {
          username,
        },
      });
    }, 900000);
  } catch (error) {
    next(error);
  }

  return res.status(200).send([user, result]);
});

export const login = async (req, res, next) => {
  try {
    let result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send(result.array());
    }
    const { email, password } = req.body;
    let user = await prismaClient.user.findFirst({
      where: {
        email,
      },
    });
    const createTime = user.createdAt;
    await prismaClient.user.deleteMany({
      where: {
        verified: false,
        createdAt: createTime < now() - 15,
      },
    });
    if (!user) {
      const error = new OperationalException("Email not found", 404);
      next(error);
    }
    if (!compareSync(password, user.password)) {
      const error = new OperationalException("Incorrect password", 401);
      next(error);
    }
    const accessToken = jwt.sign(
      {
        userId: user.userId,
        userRole: user.role,
      },
      process.env.JWT_KEY,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      {
        userId: user.userId,
        userRole: user.role,
      },
      process.env.JWT_REFRESH_KEY
    );
    refreshTokens.push(refreshToken);

    const { password: userPassword, ...userInfo } = user;
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
      })
      .status(200)
      .send([
        userInfo,
        { accessToken: accessToken },
        { refreshToken: refreshToken },
      ]);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;
    res.clearCookie("accessToken").status(200).send("logout ok");
  } catch (error) {
    next(error);
  }
};

export const refresh = (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      const error = new OperationalException("You are not authenticated", 401);
      next(error);
    }
    if (!refreshTokens.includes(refreshToken)) {
      const error = new OperationalException("Refresh token is not valid", 403);
      next(error);
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
      err && console.log(err);
      refreshTokens == refreshTokens.filter((token) => token !== refreshToken);

      const newAccessToken = jwt.sign(
        {
          userId: user.userId,
          userRole: user.role,
        },
        process.env.JWT_KEY,
        { expiresIn: "15m" }
      );
      const newRefreshToken = jwt.sign(
        {
          userId: user.userId,
          userRole: user.role,
        },
        process.env.JWT_REFRESH_KEY
      );

      res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const user = await prismaClient.user.update({
      where: {
        email: req.params.email,
      },
      data: {
        verified: true,
      },
    });
    res.send("verified");
  } catch (error) {
    next(error);
  }
};
