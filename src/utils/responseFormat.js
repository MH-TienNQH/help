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

export class responseFormatForErrors extends Response {
  constructor(statusCode, success, errors) {
    super(errors);
    this.statusCode = statusCode;
    this.success = success;
    this.errors = errors;
  }
}
