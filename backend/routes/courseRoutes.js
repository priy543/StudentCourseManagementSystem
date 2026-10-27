
const express = require("express");
const courseController = require("../controllers/courseController");
const {
  validateCourseBody,
  validateCourseId
} = require("../middleware/validateCourse");
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Public routes: anyone can view courses
router.route("/")
  .get(courseController.getCourses);

router.route("/:id")
  .get(validateCourseId, courseController.getCourseById);

// Admin-only route: create a course
router.route("/")
  .post(
    protect,
    authorizeRoles("admin"),
    validateCourseBody({ allowId: true }),
    courseController.createCourse
  );

// Admin-only routes: update or delete a course
router.route("/:id")
  .put(
    protect,
    authorizeRoles("admin"),
    validateCourseId,
    validateCourseBody(),
    courseController.updateCourse
  )
  .delete(
    protect,
    authorizeRoles("admin"),
    validateCourseId,
    courseController.deleteCourse
  );

module.exports = router;
