import { useNavigate } from "react-router-dom";

function CourseCard({ course }) {

  const navigate = useNavigate();

  function handleEnroll() {

    const loggedInUser =
      localStorage.getItem("loggedInUser");

    if (!loggedInUser) {
      alert("Please login before enrolling in a course.");
      navigate("/login");
      return;
    }

    const existingCourses =
      JSON.parse(localStorage.getItem("enrolledCourses")) || [];

    const alreadyEnrolled = existingCourses.some(
      (item) => item.id === course.id
    );

    if (alreadyEnrolled) {
      alert("You are already enrolled in this course.");
      return;
    }

    const updatedCourses = [
      ...existingCourses,
      {
        ...course,
        progress: 0
      }
    ];

    localStorage.setItem(
      "enrolledCourses",
      JSON.stringify(updatedCourses)
    );

    alert(
      "Successfully enrolled in " +
      course.name +
      "!"
    );

    navigate("/dashboard");
  }

  return (
    <div className="course-card">

      <div className="course-icon">
        📚
      </div>

      <h3>{course.name}</h3>

      <p>
        <strong>Instructor:</strong>{" "}
        {course.instructor}
      </p>

      <p>
        <strong>Duration:</strong>{" "}
        {course.duration}
      </p>

      <p>{course.description}</p>

      <button onClick={handleEnroll}>
        Enroll Now
      </button>

    </div>
  );
}

export default CourseCard;