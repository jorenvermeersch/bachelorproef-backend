class LogError extends Error {
  /**
   * Create a `LogError`.
   *
   * @param {string} message - Explanatory message.
   * @param {object} [logInfo] - Information for logging.
   */
  constructor(message, logInfo = {}) {
    super(message);
    this.logInfo = logInfo;
    this.name = 'LogError';
  }
}

module.exports = LogError;
