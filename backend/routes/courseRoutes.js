const express = require("express");
const courseController = require("../controllers/courseController");
const {
  validateCourseBody,
  validateCourseId,
} = require("../middleware/validateCourse");

const router = express.Router();

router
  .route("/")
  .get(courseController.getCourses)
  .post(validateCourseBody({ allowId: true }), courseController.createCourse);

router
  .route("/:id")
  .get(validateCourseId, courseController.getCourseById)
  .put(
    validateCourseId,
    validateCourseBody(),
    courseController.updateCourse
  )
  .delete(validateCourseId, courseController.deleteCourse);

module.exports = router;