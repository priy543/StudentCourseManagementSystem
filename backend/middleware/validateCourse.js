const ApiError = require("../utils/ApiError");

const allowedCourseFields = new Set([
  "id",
  "courseName",
  "courseCode",
  "instructor",
  "duration",
  "level",
  "category",
  "image",
  "status",
  "overview",
  "learningOutcomes",
  "modules",
]);

const requiredCourseFields = [
  "courseName",
  "courseCode",
  "instructor",
  "duration",
  "category",
  "overview",
];

const stringCourseFields = [
  "courseName",
  "courseCode",
  "instructor",
  "duration",
  "category",
  "image",
  "overview",
];

const allowedLevels = new Set([
  "Beginner",
  "Intermediate",
  "Advanced",
]);

const allowedStatuses = new Set(["Active", "Inactive"]);
const allowedModuleStringFields = new Set([
  "title",
  "videoId",
  "videoTitle",
  "videoChannel",
  "youtubeUrl",
  "description",
]);

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null)
  );
}

function validateCourseBody({ allowId = false } = {}) {
  return (req, res, next) => {
    const body = req.body;

    if (!isPlainObject(body)) {
      return next(new ApiError(400, "Request body must be a JSON object."));
    }

    const unknownFields = Object.keys(body).filter(
      (field) =>
        !allowedCourseFields.has(field) ||
        (field === "id" && !allowId)
    );

    if (unknownFields.length > 0) {
      return next(
        new ApiError(400, "Request body contains unsupported fields.", {
          fields: unknownFields,
        })
      );
    }

    const missingFields = requiredCourseFields.filter(
      (field) =>
        typeof body[field] !== "string" ||
        body[field].trim().length === 0
    );

    if (missingFields.length > 0) {
      return next(
        new ApiError(400, "Required course fields are missing.", {
          fields: missingFields,
        })
      );
    }

    for (const field of stringCourseFields) {
      if (body[field] !== undefined && typeof body[field] !== "string") {
        return next(
          new ApiError(400, `${field} must be a string.`)
        );
      }
    }

    if (
      body.id !== undefined &&
      (typeof body.id !== "string" ||
        !/^[A-Za-z0-9_-]{1,128}$/.test(body.id))
    ) {
      return next(
        new ApiError(400, "id must be a 1-128 character string using letters, numbers, _ or -.")
      );
    }

    if (body.level !== undefined && !allowedLevels.has(body.level)) {
      return next(
        new ApiError(400, "level must be Beginner, Intermediate, or Advanced.")
      );
    }

    if (body.status !== undefined && !allowedStatuses.has(body.status)) {
      return next(
        new ApiError(400, "status must be Active or Inactive.")
      );
    }

    if (
      body.learningOutcomes !== undefined &&
      (!Array.isArray(body.learningOutcomes) ||
        body.learningOutcomes.some(
          (outcome) =>
            typeof outcome !== "string" || outcome.trim().length === 0
        ))
    ) {
      return next(
        new ApiError(400, "learningOutcomes must be an array of non-empty strings.")
      );
    }

    if (body.modules !== undefined) {
      if (!Array.isArray(body.modules)) {
        return next(new ApiError(400, "modules must be an array."));
      }

      const invalidModule = body.modules.some((module) => {
        if (typeof module === "string") {
          return module.trim().length === 0;
        }

        if (!isPlainObject(module)) {
          return true;
        }

        if (
          typeof module.title !== "string" ||
          module.title.trim().length === 0
        ) {
          return true;
        }

        return Object.entries(module).some(
          ([field, value]) =>
            allowedModuleStringFields.has(field) &&
            value !== undefined &&
            typeof value !== "string"
        );
      });

      if (invalidModule) {
        return next(
          new ApiError(
            400,
            "Each module must be a non-empty title string or an object with a title string."
          )
        );
      }
    }

    next();
  };
}

function validateCourseId(req, res, next) {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(req.params.id)) {
    return next(
      new ApiError(400, "Course id must be a 1-128 character string using letters, numbers, _ or -.")
    );
  }

  next();
}

module.exports = {
  validateCourseBody,
  validateCourseId,
};