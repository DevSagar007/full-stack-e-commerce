/** Error that carries an HTTP status and a stable machine-readable code. */
class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function sendError(res, status, code, message, details) {
  res.status(status).json({ error: { code, message, ...(details !== undefined && { details }) } });
}

function notFound(req, res) {
  sendError(res, 404, "NOT_FOUND", `Route ${req.method} ${req.path} not found`);
}

// Express recognises error middleware by its four parameters, so `next` must stay.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return sendError(res, err.status, err.code, err.message, err.details);
  }
  // Errors raised by express.json() (body-parser).
  if (err.type === "entity.parse.failed") {
    return sendError(res, 400, "INVALID_JSON", "Request body is not valid JSON");
  }
  if (err.type === "entity.too.large") {
    return sendError(res, 413, "PAYLOAD_TOO_LARGE", "Request body is too large");
  }
  if (err.expose && err.status >= 400 && err.status < 500) {
    return sendError(res, err.status, "BAD_REQUEST", err.message);
  }

  console.error(`[${req.method} ${req.originalUrl}]`, err);
  sendError(res, 500, "INTERNAL_ERROR", "Something went wrong");
}

module.exports = { HttpError, notFound, errorHandler };
