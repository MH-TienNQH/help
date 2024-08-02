import jwt from "jsonwebtoken";
import { sendMailTo } from "../utils/sendMail.js";
import * as userServices from "../services/userServices.js";
import { compareSync, hashSync } from "bcrypt";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import { prismaClient } from "../routes/index.js";
import { validationResult } from "express-validator";
import { userInfo } from "os";

export const verifyEmail = async (email) => {
  await prismaClient.user.update({
    where: {
      email,
    },
    data: {
      verified: true,
    },
  });
};

export const login = async (data) => {
  let user = await userServices.findUserByEmail(data.email);
  if (!user) {
    throw new OperationalException("Email not found", 404);
  }
  if (!compareSync(data.password, user.password)) {
    throw new OperationalException("Incorrect password", 401);
  }
  const { accessToken, refreshToken } = await generateToken(user);
  return {
    user: {
      ...user,
      password: "",
    },
    accessToken,
    refreshToken,
  };
};

export const generateToken = async (user) => {
  const payload = {
    userId: user.userId,
    userRole: user.role,
  };
  const accessToken = await jwt.sign(payload, process.env.JWT_KEY, {
    expiresIn: "15m",
  });
  const refreshToken = await jwt.sign(payload, process.env.JWT_REFRESH_KEY, {
    expiresIn: "1y",
  });
  return {
    accessToken,
    refreshToken,
  };
};

export const sendVerificationEmail = async (email) => {
  await sendMailTo(
    email,
    "Verify your email",
    `<p> Verify your email <a href = "${process.env.APP_URL}/api/auth/verify/${email}">here</a></p>`
  );
};

export const refresh = async (refreshToken) => {
  const payload = await verifyRefreshToken(refreshToken);
  const response = generateToken(payload);
  return response;
};

export const verifyRefreshToken = async (refreshToken) => {
  const payload = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_KEY,
    (error, decode) => {
      if (error) {
        throw new OperationalException(error, 500);
      }
      return decode;
    }
  );
  return payload;
};

export const logout = async (refreshToken, userId) => {
  const authToken = refreshToken.startsWith("Bearer ")
    ? refreshToken.slice(7)
    : refreshToken;

  try {
    const result = await prismaClient.refreshToken.deleteMany({
      where: {
        token: authToken,
        userId: userId,
      },
    });

    if (result.count > 0) {
      return console.log("ok");
    } else {
      return new OperationalException("Invalid token", 400);
    }
  } catch (error) {
    throw new Error(error);
  }
};
export const setPassword = async (email, password, otp) => {
  const now = new Date();
  let user = await prismaClient.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    throw new OperationalException("Email doesn't exist", 401);
  }
  if (user.otp !== otp) {
    throw new OperationalException("Invalid OTP", 401);
  }
  if (now.getTime() > user.otpExpireAt) {
    throw new OperationalException("OTP expired", 401);
  }
  await prismaClient.user.update({
    where: {
      email,
    },
    data: {
      password: hashSync(password, 10),
      otp: null,
      otpCreatedAt: null,
      otpExpireAt: null,
    },
  });
  return {
    user,
  };
};
export const forgotPassword = async (email) => {
  let otp = `${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const ftmin = new Date(now.getTime() + 15 * 60 * 1000);

  sendMailTo(
    email,
    "OTP for forgot password",
    `<p> The OTP for your password reset is ${otp}. This code will expire after 15 minutes</p><br/><p>Click <a href = http://localhost:3030/forgotPassword>here</a></p>`
  );
  await prismaClient.user.update({
    where: {
      email,
    },
    data: {
      otp,
      otpCreatedAt: new Date(now.getTime()),
      otpExpireAt: ftmin,
    },
  });
  return { message: "sent otp" };
};
