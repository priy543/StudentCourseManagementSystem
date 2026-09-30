import { useNavigate } from "react-router-dom";

import {
  getLoggedInStudent
} from "../modules/auth";

import {
  enrollStudent
} from "../modules/api";

import {
  showSuccess,
  showError
} from "../modules/ui";

function CourseCard({ course }) {
  const navigate = useNavigate();

  function handleEnroll() {
    const student =
      getLoggedInStudent();

    if (!student) {
      showError(
        "Please login before enrolling in a course."
      );

      navigate("/login");
      return;
    }

    const result =
      enrollStudent(
        student.email,
        course
      );

    if (!result.success) {
      showError(result.message);
      return;
    }

    showSuccess(result.message);

    navigate("/dashboard");
  }

  return (
    <div className="course-card">

      <div className="course-icon">
        📚
      </div>

      <h3>
        {course.name}
      </h3>

      <p>
        <strong>
          Instructor:
        </strong>{" "}
        {course.instructor}
      </p>

      <p>
        <strong>
          Duration:
        </strong>{" "}
        {course.duration}
      </p>

      <p>
        {course.description}
      </p>

      <button
        onClick={handleEnroll}
      >
        Enroll Now
      </button>

    </div>
  );
}

export default CourseCard;