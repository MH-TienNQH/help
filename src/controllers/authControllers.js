import { compareSync, hashSync } from "bcrypt";
import { prismaClient } from "../routes/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { validationResult } from "express-validator";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";
import { sendMailTo } from "../utils/sendMail.js";
import { responseFormat } from "../utils/responseFormat.js";
import * as authServices from "../services/authServices.js";

dotenv.config();

export const signUp = asyncErrorHandler(async (req, res, next) => {
  let result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
  }
  const data = req.body;
  let user = await prismaClient.user.findFirst({
    where: {
      username: data.username,
    },
  });
  if (user) {
    const error = new OperationalException("User already exist", 400);
    next(error);
  }
  user = await userServices.addUser(data);
  try {
    sendMailTo(
      data.email,
      "Verify your email",
      `<p> Verify your email <a href = "${process.env.APP_URL}/api/auth/verify/${data.email}">here</a></p>`
    );
  } catch (error) {
    next(error);
  }
  return res.send(new responseFormat(200, true, user));
});

export const login = async (req, res, next) => {
  try {
    let result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send(result.array({ onlyFirstError: true }));
    }
    const { email, password } = req.body;
    let user = await prismaClient.user.findFirst({
      where: {
        email,
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
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "1y" }
    );

    const { password: userPassword, ...userInfo } = user;

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 900000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 3.154e10,
      })
      .send([
        new responseFormat(200, true, [
          userInfo,
          { accessToken: accessToken },
          { refreshToken: refreshToken },
        ]),
      ]);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .send(new responseFormat(200, true, "logged out"));
  } catch (error) {
    next(error);
  }
};

export const refresh = (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      const error = new OperationalException("You are not authenticated", 401);
      next(error);
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (error, user) => {
      error && next(error);

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
        process.env.JWT_REFRESH_KEY,
        { expiresIn: "1y" }
      );

      res.send(
        new responseFormat(200, true, [
          {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
        ])
      );
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    let email = req.params.email;
    await authServices.verifyEmail(email);
    res.send("verified");
  } catch (error) {
    next(error);
  }
};
