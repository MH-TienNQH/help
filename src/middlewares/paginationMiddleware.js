import { OperationalException } from "../exceptions/operationalExceptions.js";

// paginationMiddleware.js
const paginationMiddleware = (req, res, next) => {
  // Extract pagination parameters from query
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  if (page < 1 || limit < 1) {
    throw new OperationalException(
      "Page and limit must be positive integers",
      401
    );
  }

  req.pagination = {
    page,
    limit,
  };

  next();
};

export default paginationMiddleware;
