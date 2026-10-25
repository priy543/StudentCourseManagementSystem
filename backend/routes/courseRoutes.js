
const express = require("express");
const courseController = require("../controllers/courseController");
const {
  validateCourseBody,
  validateCourseId
} = require("../middleware/validateCourse");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.route("/")
  .get(courseController.getCourses);

router.route("/:id")
  .get(validateCourseId, courseController.getCourseById);

// Protected routes
router.route("/")
  .post(
    protect,
    validateCourseBody({ allowId: true }),
    courseController.createCourse
  );

router.route("/:id")
  .put(
    protect,
    validateCourseId,
    validateCourseBody(),
    courseController.updateCourse
  )
  .delete(
    protect,
    validateCourseId,
    courseController.deleteCourse
  );

module.exports = router;
