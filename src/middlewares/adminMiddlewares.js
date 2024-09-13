import {
  AuthOperationalErrorConstants,
  roleConstants,
} from "../constants/constants.js";
import { OperationalException } from "../exceptions/operationalExceptions.js";

const adminMiddlewares = (req, res, next) => {
  const userRole = req.userRole;
  if (userRole === roleConstants[1]) {
    next();
  } else {
    const error = new OperationalException(
      403,
      false,
      AuthOperationalErrorConstants.NOT_AUTHORIZED_ERROR
    );
    next(error);
  }
};

export default adminMiddlewares;
