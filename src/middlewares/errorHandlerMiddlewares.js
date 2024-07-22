export const errorHandlerMiddlewares = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  res.status(error.statusCode).json({
    message: error.message,
    statusCode: error.statusCode,
  });
};
