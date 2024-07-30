import { compareSync, hashSync } from "bcrypt";
import { prismaClient } from "../routes/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { validationResult } from "express-validator";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";
import { sendMailTo } from "../utils/sendMail.js";
import { responseFormat } from "../utils/responseFormat.js";
dotenv.config();

export const signUp = asyncErrorHandler(async (req, res, next) => {
  let result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
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
    const refreshToken = req.cookies.refreshToken;
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
export const forgotPassword = async (req, res, next) => {
  try {
    let result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).send(result.array({ onlyFirstError: true }));
    }
    const { email } = req.body;
    let user = await prismaClient.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      const error = new OperationalException("Email doesn't exist", 401);
      next(error);
    }
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_KEY, {
      expiresIn: "15m",
    });
    try {
      let otp = `${Math.floor(1000 + Math.random() * 9000)}`;
      sendMailTo(
        email,
        "OTP for forgot password",
        `<p> The OTP for your password reset is ${otp}. This code will expire after 15 minutes</p><br/><p>Click <a href = http://localhost:3030/forgotPassword/${token}>here</a></p>`
      );
      await prismaClient.oTP.create({
        data: {
          otp,
          user: {
            connect: {
              userId: user.userId,
            },
          },
        },
      });
    } catch (error) {
      next(error);
    }
    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    let result = validationResult(req);
    const { token } = req.params;
    const { otp, newPassword } = req.body;

    jwt.verify(token, process.env.JWT_KEY, async (error, payload) => {
      try {
        if (error) {
          next(error);
        }
        let otpCode = await prismaClient.oTP.findUnique({
          where: {
            otp,
          },
        });
        if (!otpCode) {
          const error = new OperationalException("Wrong otp", 403);
          next(error);
        }

        await prismaClient.user.update({
          where: {
            userId: payload.userId,
          },
          data: {
            password: hashSync(newPassword, 10),
          },
        });
        await prismaClient.oTP.delete({
          where: {
            otp,
          },
        });
        res.status(200).send("ok");
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};
