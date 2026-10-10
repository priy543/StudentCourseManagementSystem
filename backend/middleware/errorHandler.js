const mongoose = require("mongoose");

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || "Internal server error.";
  let details = error.details;

  if (error.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Request body contains invalid JSON.";
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Course validation failed.";
    details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Request contains an invalid value.";
  } else if (error.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(error.keyPattern || {})[0];
    message =
      duplicateField === "courseCode"
        ? "A course with this courseCode already exists."
        : duplicateField === "id"
          ? "A course with this id already exists."
          : "A course with this value already exists.";
  }

  if (statusCode >= 500) {
    console.error(error);
    message = "Internal server error.";
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details ? { details } : {}),
    },
  });
}

module.exports = errorHandler;