class HttpError extends Error {
  constructor(status, message, detalles = null) {
    super(message);

    this.name = 'HttpError';
    this.status = status;

    if (detalles !== null) {
      this.detalles = detalles;
    }

    Error.captureStackTrace?.(this, HttpError);
  }
}

module.exports = HttpError;