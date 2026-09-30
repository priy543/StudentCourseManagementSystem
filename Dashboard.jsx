import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {

  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // Load student and enrolled courses
  useEffect(() => {

    const savedStudent =
      JSON.parse(localStorage.getItem("student"));

    const loggedInUser =
      localStorage.getItem("loggedInUser");

    // Check login
    if (!savedStudent || !loggedInUser) {

      alert("Please Login First");

      navigate("/login");

      return;
    }

    // Store student information
    setStudent(savedStudent);

    // Get enrolled courses
    const savedCourses =
      JSON.parse(
        localStorage.getItem("enrolledCourses")
      ) || [];

    setEnrolledCourses(savedCourses);

  }, [navigate]);


  // Logout
  function handleLogout() {

    localStorage.removeItem("loggedInUser");

    alert("Logged out successfully");

    navigate("/login");
  }


  // Count completed courses
  const completedCourses =
    enrolledCourses.filter(
      (course) => course.progress === 100
    ).length;


  // Calculate overall progress
  const overallProgress =
    enrolledCourses.length > 0
      ? Math.round(
          enrolledCourses.reduce(
            (total, course) =>
              total + (course.progress || 0),
            0
          ) / enrolledCourses.length
        )
      : 0;


  // Prevent dashboard from showing before student data loads
  if (!student) {
    return null;
  }


  return (
    <>
      {/* Navigation Bar */}

      <Navbar />


      {/* Dashboard */}

      <main className="dashboard">

        <h1>Student Dashboard</h1>

        <p className="dashboard-welcome">
          Welcome back, {student.name}! 👋
        </p>


        {/* ========================= */}
        {/* STUDENT PROFILE */}
        {/* ========================= */}

        <div className="profile-section">

          <h2>👤 Student Profile</h2>

          <p>
            <strong>Name:</strong>{" "}
            {student.name}
          </p>

          <p>
            <strong>Department:</strong>{" "}
            {student.department}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {student.email}
          </p>

          <p>
            <strong>Course Interest:</strong>{" "}
            {student.course}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            Active Learner
          </p>

        </div>


        {/* ========================= */}
        {/* DASHBOARD STATISTICS */}
        {/* ========================= */}

        <div className="dashboard-cards">


          {/* Enrolled Courses */}

          <div className="dashboard-card">

            <h2>📚 Enrolled Courses</h2>

            <p>
              {enrolledCourses.length}
            </p>

          </div>


          {/* Completed Courses */}

          <div className="dashboard-card">

            <h2>✅ Completed Courses</h2>

            <p>
              {completedCourses}
            </p>

          </div>


          {/* Overall Progress */}

          <div className="dashboard-card">

            <h2>📊 Overall Progress</h2>

            <p>
              {overallProgress}%
            </p>

          </div>

        </div>


        {/* ========================= */}
        {/* ENROLLED COURSES */}
        {/* ========================= */}

        <div className="progress-section">

          <h2>📚 My Enrolled Courses</h2>


          {/* No Courses */}

          {enrolledCourses.length === 0 ? (

            <div>

              <p>
                You have not enrolled in any courses yet.
              </p>

              <Link to="/courses">

                <button className="dashboard-button">
                  Browse Courses
                </button>

              </Link>

            </div>

          ) : (


            /* Display Courses */

            enrolledCourses.map((course) => (

              <div
                className="enrolled-course"
                key={course.id}
              >


                {/* Course Name + Progress */}

                <div className="progress-title">

                  <span>
                    <strong>
                      {course.name}
                    </strong>
                  </span>

                  <span>
                    {course.progress || 0}%
                  </span>

                </div>


                {/* Progress Bar */}

                <div className="progress-bar">

                  <div
                    className="progress-fill"
                    style={{
                      width:
                        (course.progress || 0) + "%"
                    }}
                  ></div>

                </div>


                {/* Instructor */}

                <p>
                  <strong>
                    Instructor:
                  </strong>{" "}
                  {course.instructor}
                </p>


                {/* Duration */}

                <p>
                  <strong>
                    Duration:
                  </strong>{" "}
                  {course.duration}
                </p>


                {/* Continue Learning */}

                <button
                  onClick={() =>
                    navigate(
                      `/learning/${course.id}`
                    )
                  }
                >
                  Continue Learning
                </button>


                {/* Completed Message */}

                {course.progress === 100 && (

                  <p>
                    🎉 Course Completed!
                  </p>

                )}

              </div>

            ))

          )}

        </div>


        {/* ========================= */}
        {/* NOTIFICATIONS */}
        {/* ========================= */}

        <div className="notification-section">

          <h2>🔔 Notifications</h2>

          <p>
            📢 New Python module is available.
          </p>

          <p>
            📚 Web Development assignment is due soon.
          </p>

          <p>
            🎉 You completed a learning module!
          </p>

        </div>


        {/* ========================= */}
        {/* ACTION BUTTONS */}
        {/* ========================= */}


        <Link to="/courses">

          <button className="dashboard-button">
            Browse Courses
          </button>

        </Link>


        <button
          className="dashboard-button"
          onClick={handleLogout}
        >
          Logout
        </button>


      </main>


      {/* Footer */}

      <Footer />

    </>
  );
}

export default Dashboard;