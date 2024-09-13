import dotenv from "dotenv";
import { validationResult } from "express-validator";
import { OperationalException } from "../exceptions/operationalExceptions.js";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";
import {
  responseFormat,
  responseFormatForErrors,
} from "../utils/responseFormat.js";
import * as authServices from "../services/authServices.js";
import * as userServices from "../services/userServices.js";
import {
  AccountOperationalErrorsConstants,
  AuthOperationalErrorConstants,
} from "../constants/constants.js";

dotenv.config();

export const signUp = asyncErrorHandler(async (req, res, next) => {
  if (!req.files.avatar) {
    return res.json(
      new responseFormatForErrors(401, false, {
        message: AccountOperationalErrorsConstants.AVATAR_NULL_ERROR,
      })
    );
  }

  if (req.files.avatar && req.files.avatar.length > 1) {
    return res.json(
      new responseFormatForErrors(401, false, {
        message: AccountOperationalErrorsConstants.MULTIPLE_AVATAR_ERROR,
      })
    );
  }
  const data = req.body;
  const avatar = req.cloudinaryUrls;

  const user = await userServices.addUser(data, avatar);
  try {
    authServices.sendVerificationEmail(data.email);
  } catch (error) {
    next(error);
  }
  return res.send(new responseFormat(200, true, user));
});

export const login = asyncErrorHandler(async (req, res) => {
  const data = req.body;

  const response = await authServices.login(data);
  const { accessToken, refreshToken } = response;
  res
    .cookie("refreshToken", refreshToken, {
      maxAge: 31536000000, // 1 year in milliseconds
      httpOnly: true,
    })
    .send(new responseFormat(200, true, response));
});

export const logout = asyncErrorHandler(async (req, res, next) => {
  const userId = req.userId;

  const response = await authServices.logout(userId);
  res.clearCookie("refreshToken").send(new responseFormat(200, true, response));
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
    const error = new OperationalException(
      401,
      false,
      AuthOperationalErrorConstants.NOT_AUTHORIZED_ERROR
    );
    next(error);
  }
  const response = await authServices.refresh(refreshToken);
  res
    .cookie("refreshToken", response.refreshToken, {
      httpOnly: true,
      maxAge: 3.156e10,
    })
    .send(new responseFormat(200, true, response));
});

export const verifyEmail = asyncErrorHandler(async (req, res) => {
  let email = req.params.email;
  const response = await authServices.verifyEmail(email);
  res.send(new responseFormat(200, true, response));
});

export const setPassword = asyncErrorHandler(async (req, res) => {
  let result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).send(result.array({ onlyFirstError: true }));
  }
  const { email, otp, password } = req.body;
  let response = await authServices.setPassword(email, password, otp);
  res.send(new responseFormat(200, true, response));
});

export const forgotPassword = asyncErrorHandler(async (req, res) => {
  const { email } = req.body;
  let response = await authServices.forgotPassword(email);
  res.send(new responseFormat(200, true, response));
});
