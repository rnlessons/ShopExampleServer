export default class APIError extends Error {
  constructor(code, message, status = 500) {
    super(message);

    this.status = status;
    this.code = code;
    this.message = message;

    Error.captureStackTrace(this);
  }
}
