import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";
import * as commentServices from "../services/commentServices.js";
import {
  responseFormat,
  responseFormatWithPagination,
} from "../utils/responseFormat.js";

export const getComments = asyncErrorHandler(async (req, res) => {
  const { productId, order } = req.query;
  const { page, limit } = req.pagination;
  const comments = await commentServices.getComments(
    productId,
    order,
    page,
    limit
  );
  res.send(
    new responseFormatWithPagination(
      200,
      true,
      comments.comments,
      comments.meta
    )
  );
});
export const addComment = asyncErrorHandler(async (req, res) => {
  const productId = req.params.id;
  const userId = req.userId;
  const data = req.body;
  const comment = await commentServices.addComment(productId, userId, data);
  res.send(new responseFormat(200, true, comment));
});

export const updateComment = asyncErrorHandler(async (req, res) => {
  const commentId = req.params.id;
  const userId = req.userId;
  const data = req.body;
  const comment = await commentServices.updateComment(commentId, userId, data);
  res.send(new responseFormat(200, true, comment));
});

export const deleteComment = asyncErrorHandler(async (req, res) => {
  const commentId = req.params.id;
  const userId = req.userId;
  await commentServices.deleteComment(commentId, userId);
  res.send(new responseFormat(200, true, "comment deleted"));
});
