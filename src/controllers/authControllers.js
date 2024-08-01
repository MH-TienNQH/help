import dotenv from "dotenv";
import { validationResult } from "express-validator";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";
import { responseFormat } from "../utils/responseFormat.js";
import * as authServices from "../services/authServices.js";
import * as userServices from "../services/userServices.js";

dotenv.config();

export const signUp = asyncErrorHandler(async (req, res, next) => {
  let result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
  }
  const data = req.body;
  let user = await userServices.findUserByEmail(data.email);
  if (user) {
    const error = new OperationalException("User already exist", 400);
    next(error);
  }
  user = await userServices.addUser(data);
  try {
    authServices.sendVerificationEmail(data.email);
  } catch (error) {
    next(error);
  }
  return res.send(new responseFormat(200, true, user));
});

export const login = asyncErrorHandler(async (req, res) => {
  let result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
  }
  const data = req.body;

  const response = await authServices.login(data);
  res.send(new responseFormat(200, true, response));
});

export const logout = asyncErrorHandler(async (req, res, next) => {
  const refreshToken = req.headers["authorization"];

  if (!refreshToken) {
    return res.status(400).json({ error: "Token is missing" });
  }
  const response = await authServices.logout(refreshToken);

  res.send(new responseFormat(200, true, response));
});

export const refresh = asyncErrorHandler(async (req, res, next) => {
  let refreshToken = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    refreshToken = req.headers.authorization.split(" ")[1];
  }

  if (!refreshToken) {
    const error = new OperationalException("You are not authenticated", 401);
    next(error);
  }
  const response = await authServices.refresh(refreshToken);
  res.send(new responseFormat(200, true, response));
});

export const verifyEmail = asyncErrorHandler(async (req, res) => {
  let email = req.params.email;
  await authServices.verifyEmail(email);
  res.send("verified");
});

export const setPassword = asyncErrorHandler(async (req, res) => {
  let result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
  }
  const { email, otp, newPassword } = req.body;
  let response = await authServices.setPassword(email, newPassword, otp);
  res.send(new responseFormat(200, true, response));
});

export const forgotPassword = asyncErrorHandler(async (req, res) => {
  let result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
  }
  const email = req.body;
  let response = await authServices.forgotPassword(email);
  res.send(new responseFormat(200, true, response));
});
