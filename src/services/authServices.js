import jwt from "jsonwebtoken";
import { sendMailTo } from "../utils/sendMail.js";
import * as userServices from "../services/userServices.js";
import { compareSync, hashSync } from "bcrypt";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import { prismaClient } from "../routes/index.js";
import { responseFormat } from "../utils/responseFormat.js";
import { io } from "../socket.io/server.js";
import { socket } from "../../index.js";

export const verifyEmail = async (email) => {
  let user = await userServices.findUserByEmail(email);
  if (user) {
    await prismaClient.user.update({
      where: {
        email,
      },
      data: {
        verified: true,
      },
    });
    return true;
  }
  throw new OperationalException(404, false, "Email not found");
};

export const login = async (data) => {
  let user = await userServices.findUserByEmail(data.email);
  if (!user) {
    throw new OperationalException(404, false, "Email not found");
  }
  if (!compareSync(data.password, user.password)) {
    throw new OperationalException(401, false, "Incorrect password");
  }
  const { accessToken, refreshToken } = await generateToken(user);
  await prismaClient.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.userId,
    },
  });
  socket.emit("login", user.userId);
  return {
    user,
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
  const user = await prismaClient.user.findUnique({
    where: {
      userId: payload.userId,
    },
  });
  if (!user) {
    throw new OperationalException("User not found", 404);
  }
  const response = generateToken(user);
  await prismaClient.refreshToken.update({
    where: {
      userId: user.userId,
      token: refreshToken,
    },
    data: {
      token: (await response).refreshToken,
    },
  });
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

export const logout = async (userId) => {
  await prismaClient.refreshToken.deleteMany({
    where: {
      userId: userId,
    },
  });
  return new responseFormat(200, true, { message: "Logged out" });
};
export const setPassword = async (email, password, otp) => {
  const now = new Date();
  let user = await prismaClient.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    throw new OperationalException(404, false, "Email doesn't exist");
  }
  if (user.otp !== otp) {
    throw new OperationalException(401, false, "Invalid OTP");
  }
  if (now.getTime() > user.otpExpireAt) {
    throw new OperationalException(401, false, "OTP expired");
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
  return true;
};
export const forgotPassword = async (email) => {
  const user = await userServices.findUserByEmail(email);
  if (user) {
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
    return true;
  }
  throw new OperationalException(404, false, "Email doesn't exist");
};
