import jwt from "jsonwebtoken";
import { sendMailTo } from "../utils/sendMail.js";
import * as userServices from "../services/userServices.js";
import { compareSync } from "bcrypt";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import { decode } from "punycode";
import { response } from "express";
import { prismaClient } from "../routes/index.js";
import { responseFormat } from "../utils/responseFormat.js";

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
  await prismaClient.refreshToken.create({
    data: {
      userId: user.userId,
      token: refreshToken,
    },
  });
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

export const logout = async (refreshToken) => {
  const authToken = refreshToken.startsWith("Bearer ")
    ? refreshToken.slice(7)
    : refreshToken;

  try {
    const result = await prismaClient.refreshToken.deleteMany({
      where: {
        token: authToken,
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
