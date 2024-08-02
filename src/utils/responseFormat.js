export class responseFormat extends Response {
  constructor(statusCode, success, data) {
    super(data);
    this.statusCode = statusCode;
    this.success = success;
    this.data = data;
  }
}

export class responseFormatWithPagination extends Response {
  constructor(statusCode, success, data, meta) {
    super(data);
    this.statusCode = statusCode;
    this.success = success;
    this.data = data;
    this.meta = meta;
  }
}
