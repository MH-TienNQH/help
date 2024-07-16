import { compareSync, hashSync } from "bcrypt";
import { prismaClient } from "../routes/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { userInfo } from "os";

dotenv.config();

const refreshTokens = [];
export const signUp = async (req, res) => {
  const { username, email, password, name, avatar } = req.body;

  let user = await prismaClient.user.findFirst({
    where: {
      username,
    },
  });
  if (user) {
    res.status(400).send("user exist");
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
  res.status(200).send(user);
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  let user = await prismaClient.user.findFirst({
    where: {
      username,
    },
  });
  if (!user) {
    res.status(401).send("username not found");
  }
  if (!compareSync(password, user.password)) {
    res.status(401).send("wrong pw");
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
};

export const logout = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  res.clearCookie("accessToken").status(200).send("logout ok");
};

export const refresh = (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.status(401).json("You are not authenticated!");
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh token is not valid!");
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

    refreshTokens.push(newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
};
