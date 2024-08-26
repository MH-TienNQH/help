export class OperationalException extends Error {
  constructor(statusCode, success, message) {
    super(message);

    this.statusCode = statusCode;
    this.success = success;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
