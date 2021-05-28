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

  static notFound(message, id) {
    return new ServiceError('NOT_FOUND', message, { id });
  }

  static validationFailed(message, details) {
    return new ServiceError('VALIDATION_FAILED', message, details);
  }
}

module.exports = ServiceError;
