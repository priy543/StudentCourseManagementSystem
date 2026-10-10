const Course = require("../models/Course");
const ApiError = require("../utils/ApiError");

function serializeCourse(course) {
  if (!course) {
    return null;
  }

  const data = course.toObject();

  return {
    ...data,
    _id: data._id.toString(),
    id: data.id || data._id.toString(),
  };
}

async function getCourses() {
  const courses = await Course.find().sort({ courseName: 1 });
  return courses.map(serializeCourse);
}

async function getCourseById(id) {
  const course = await Course.findOne({ id });

  if (!course) {
    throw new ApiError(404, "Course not found.");
  }

  return serializeCourse(course);
}

async function createCourse(courseData) {
  const course = await Course.create(courseData);
  return serializeCourse(course);
}

async function updateCourse(id, courseData) {
  const course = await Course.findOneAndUpdate(
    { id },
    { $set: courseData },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!course) {
    throw new ApiError(404, "Course not found.");
  }

  return serializeCourse(course);
}

async function deleteCourse(id) {
  const course = await Course.findOneAndDelete({ id });

  if (!course) {
    throw new ApiError(404, "Course not found.");
  }

  return serializeCourse(course);
}

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};