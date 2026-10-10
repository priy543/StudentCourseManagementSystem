const courseService = require("../services/courseService");

async function getCourses(req, res) {
  const courses = await courseService.getCourses();
  res.status(200).json({ success: true, data: courses });
}

async function getCourseById(req, res) {
  const course = await courseService.getCourseById(req.params.id);
  res.status(200).json({ success: true, data: course });
}

async function createCourse(req, res) {
  const course = await courseService.createCourse(req.body);
  res.status(201).json({ success: true, data: course });
}

async function updateCourse(req, res) {
  const course = await courseService.updateCourse(
    req.params.id,
    req.body
  );
  res.status(200).json({ success: true, data: course });
}

async function deleteCourse(req, res) {
  const course = await courseService.deleteCourse(req.params.id);
  res.status(200).json({ success: true, data: course });
}

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};