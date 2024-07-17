export class HttpException extends Error {
  constructor(message, errorCode, statusCode, errors) {
    super(message);
    this.message = message;
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const ErrorCodes = Object.freeze({
  USER_NOT_FOUND: 1001,
  USER_ALREADY_EXIST: 1002,
  INCORRECT_PASSWORD: 1003,
});
