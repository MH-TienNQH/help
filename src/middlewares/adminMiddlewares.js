import { OperationalException } from "../exceptions/operationalExceptions.js";

const adminMiddlewares = (req, res, next) => {
  const userRole = req.userRole;
  if (userRole == "ADMIN") {
    next();
  } else {
    const error = new OperationalException("Unauthorized", 403);
    next(error);
  }
};

export default adminMiddlewares;
