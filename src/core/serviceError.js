const NOT_FOUND = 'NOT_FOUND';
const VALIDATION_FAILED = 'VALIDATION_FAILED';
const UNAUTHORIZED = 'UNAUTHORIZED';

class ServiceError extends Error {

  /**
   * Create a `ServiceError`.
   *
   * @param {string} code - Unique code for this error.
   * @param {string} message - Explanatory message.
   * @param {object} [details] - Extra details.
   */
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'ServiceError';
  }

  static notFound(message, details) {
    return new ServiceError(NOT_FOUND, message, details);
  }

  static validationFailed(message, details) {
    return new ServiceError(VALIDATION_FAILED, message, details);
  }

  static unauthorized(message, details) {
    return new ServiceError(UNAUTHORIZED, message, details);
  }

  get isNotFound() {
    return this.code === NOT_FOUND;
  }

  get isValidationFailed() {
    return this.code === VALIDATION_FAILED;
  }

  get isUnauthorized() {
    return this.code === UNAUTHORIZED;
  }
}

module.exports = ServiceError;
