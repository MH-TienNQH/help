import { ErrorCodes, HttpException } from "./rootExceptions";

export class BadRequestsException extends HttpException {
  errorCode = ErrorCodes;
  constructor(message, errorCode) {
    super(message, errorCode, 400, null);
    this.message = message;
    this.errorCode = errorCode;
  }
}
