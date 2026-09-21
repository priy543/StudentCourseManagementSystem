import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {

  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {

    const adminLoggedIn =
      localStorage.getItem("adminLoggedIn");

    if (adminLoggedIn !== "true") {

      alert("Please login as Admin");

      navigate("/admin-login");

      return;
    }

    const savedCourses =
      JSON.parse(
        localStorage.getItem("adminCourses")
      ) || [];

    const savedStudent =
      JSON.parse(
        localStorage.getItem("student")
      );

    const savedEnrollments =
      JSON.parse(
        localStorage.getItem("enrolledCourses")
      ) || [];

    setCourses(savedCourses);

    if (savedStudent) {
      setStudents([savedStudent]);
    }

    setEnrolledCourses(savedEnrollments);

  }, [navigate]);


  function handleLogout() {

    localStorage.removeItem("adminLoggedIn");

    alert("Admin logged out successfully");

    navigate("/admin-login");
  }


  const completedCourses =
    enrolledCourses.filter(
      (course) => course.progress === 100
    ).length;


  const averageProgress =
    enrolledCourses.length > 0
      ? Math.round(
          enrolledCourses.reduce(
            (total, course) =>
              total + (course.progress || 0),
            0
          ) / enrolledCourses.length
        )
      : 0;


  return (
    <>
      <Navbar />

      <main className="dashboard">

        <h1>🛠️ Admin Dashboard</h1>

        <p className="dashboard-welcome">
          Welcome, Administrator! 👋
        </p>


        {/* ========================= */}
        {/* STATISTICS */}
        {/* ========================= */}

        <div className="dashboard-cards">

          <div className="dashboard-card">

            <h2>📚 Total Courses</h2>

            <p>
              {courses.length}
            </p>

          </div>


          <div className="dashboard-card">

            <h2>👨‍🎓 Total Students</h2>

            <p>
              {students.length}
            </p>

          </div>


          <div className="dashboard-card">

            <h2>📝 Total Enrollments</h2>

            <p>
              {enrolledCourses.length}
            </p>

          </div>


          <div className="dashboard-card">

            <h2>✅ Completed Courses</h2>

            <p>
              {completedCourses}
            </p>

          </div>


          <div className="dashboard-card">

            <h2>📈 Average Progress</h2>

            <p>
              {averageProgress}%
            </p>

          </div>

        </div>


        {/* ========================= */}
        {/* ADMINISTRATION */}
        {/* ========================= */}

        <div className="profile-section">

          <h2>⚙️ Administration</h2>

          <button
            className="dashboard-button"
            onClick={() =>
              navigate("/admin-courses")
            }
          >
            📚 Manage Courses
          </button>


          <button
            className="dashboard-button"
            onClick={() =>
              navigate("/admin-students")
            }
          >
            👨‍🎓 Manage Students
          </button>


          <button
            className="dashboard-button"
            onClick={() =>
              navigate("/admin-reports")
            }
          >
            📊 View Reports
          </button>

        </div>


        {/* ========================= */}
        {/* COURSE ANALYTICS */}
        {/* ========================= */}

        <div className="progress-section">

          <h2>📊 Course Analytics</h2>


          {enrolledCourses.length === 0 ? (

            <p>
              No student enrollments available yet.
            </p>

          ) : (

            enrolledCourses.map((course) => (

              <div
                className="enrolled-course"
                key={course.id}
              >

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


                <div className="progress-bar">

                  <div
                    className="progress-fill"
                    style={{
                      width:
                        (course.progress || 0) +
                        "%"
                    }}
                  ></div>

                </div>


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


                {course.progress === 100 ? (

                  <p>
                    🎉 Completed
                  </p>

                ) : (

                  <p>
                    📖 In Progress
                  </p>

                )}

              </div>

            ))

          )}

        </div>


        {/* ========================= */}
        {/* COURSE SUMMARY */}
        {/* ========================= */}

        <div className="progress-section">

          <h2>📚 Available Courses</h2>


          {courses.length === 0 ? (

            <p>
              No courses have been added by the admin.
            </p>

          ) : (

            courses.map((course) => (

              <div
                className="enrolled-course"
                key={course.id}
              >

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

              </div>

            ))

          )}

        </div>


        {/* ========================= */}
        {/* LOGOUT */}
        {/* ========================= */}

        <button
          className="dashboard-button"
          onClick={handleLogout}
        >
          🚪 Admin Logout
        </button>

      </main>

      <Footer />
    </>
  );
}

export default AdminDashboard;