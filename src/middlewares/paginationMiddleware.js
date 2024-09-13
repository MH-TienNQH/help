import { OperationalException } from "../exceptions/operationalExceptions.js";
import { paginationConstants } from "../constants/constants.js";

// paginationMiddleware.js
const paginationMiddleware = (req, res, next) => {
  // Extract pagination parameters from query
  const page = parseInt(req.query.page) || paginationConstants.PAGE_NUMBER;
  const limit = parseInt(req.query.limit) || paginationConstants.LIMIT_NUMBER;

  if (page < 1 || limit < 1) {
    throw new OperationalException(
      401,
      false,
      "Page and limit must be positive integers"
    );
  }

  req.pagination = {
    page,
    limit,
  };

  next();
};

export default paginationMiddleware;
