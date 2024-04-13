const LogError = require('./logError');

const NOT_FOUND = 'NOT_FOUND';
const VALIDATION_FAILED = 'VALIDATION_FAILED';
const UNAUTHORIZED = 'UNAUTHORIZED';
const FORBIDDEN = 'FORBIDDEN';
const CONFLICT = 'CONFLICT';

class ServiceError extends LogError {
  /**
   * Create a `ServiceError`.
   *
   * @param {string} code - Unique code for this error.
   * @param {string} message - Explanatory message.
   * @param {object} [details] - Extra details.
   * @param {object} [logInfo] - Information for logging.
   */
  constructor(code, message, details = {}, logInfo = {}) {
    super(message, logInfo);
    this.code = code;
    this.details = details;
    this.name = 'ServiceError';
  }

  static notFound(message, details, logInfo) {
    return new ServiceError(NOT_FOUND, message, details, logInfo);
  }

  static validationFailed(message, details, logInfo) {
    return new ServiceError(VALIDATION_FAILED, message, details, logInfo);
  }

  static unauthorized(message, details, logInfo) {
    return new ServiceError(UNAUTHORIZED, message, details, logInfo);
  }

  static forbidden(message, details, logInfo) {
    return new ServiceError(FORBIDDEN, message, details, logInfo);
  }

  static conflict(message, details, logInfo) {
    return new ServiceError(CONFLICT, message, details, logInfo);
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

  get isForbidden() {
    return this.code === FORBIDDEN;
  }

  get isConflict() {
    return this.code === CONFLICT;
  }
}

module.exports = ServiceError;
