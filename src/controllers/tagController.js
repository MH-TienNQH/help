import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";
import * as tagServices from "../services/tagServices.js";
import { responseFormat } from "../utils/responseFormat.js";

export const getUsers = asyncErrorHandler(async (req, res) => {
  const { name } = req.query;
  const response = await tagServices.getUsers(name);
  res.send(new responseFormat(200, true, response));
});

export const tag = asyncErrorHandler(async (req, res) => {
  const data = req.body;
  const taggerId = req.userId;
  const response = await tagServices.tagUser(data, taggerId);
  res.send(new responseFormat(200, true, response));
});
