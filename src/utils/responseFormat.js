export class responseFormat extends Response {
  constructor(statusCode, success, data) {
    super(data);
    this.statusCode = statusCode;
    this.success = success;
    this.data = data;
  }
}
