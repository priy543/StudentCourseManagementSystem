import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function AdminReports() {

  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [student, setStudent] = useState(null);

  useEffect(() => {

    const adminLoggedIn =
      localStorage.getItem("adminLoggedIn");

    if (adminLoggedIn !== "true") {

      alert("Please login as Admin");

      navigate("/admin-login");

      return;
    }

    const adminCourses =
      JSON.parse(
        localStorage.getItem("adminCourses")
      ) || [];

    const enrolled =
      JSON.parse(
        localStorage.getItem("enrolledCourses")
      ) || [];

    const savedStudent =
      JSON.parse(
        localStorage.getItem("student")
      );

    setCourses(adminCourses);
    setEnrolledCourses(enrolled);
    setStudent(savedStudent);

  }, [navigate]);


  const totalCourses = courses.length;

  const totalStudents = student ? 1 : 0;

  const totalEnrollments =
    enrolledCourses.length;


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

      <main className="admin-reports-page">

        <h1>📊 Reports & Analytics</h1>

        <p>
          Monitor course, student and learning
          progress statistics.
        </p>


        {/* Statistics */}

        <div className="dashboard-cards">

          <div className="dashboard-card">

            <h2>📚 Total Courses</h2>

            <p>
              {totalCourses}
            </p>

          </div>


          <div className="dashboard-card">

            <h2>👨‍🎓 Total Students</h2>

            <p>
              {totalStudents}
            </p>

          </div>


          <div className="dashboard-card">

            <h2>📝 Total Enrollments</h2>

            <p>
              {totalEnrollments}
            </p>

          </div>


          <div className="dashboard-card">

            <h2>✅ Completed Courses</h2>

            <p>
              {completedCourses}
            </p>

          </div>

        </div>


        {/* Learning Progress */}

        <div className="report-section">

          <h2>📈 Learning Progress</h2>

          <p>
            <strong>
              Average Student Progress:
            </strong>{" "}
            {averageProgress}%
          </p>


          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width:
                  averageProgress + "%"
              }}
            ></div>

          </div>

        </div>


        {/* Enrollment Report */}

        <div className="report-section">

          <h2>📚 Enrollment Report</h2>

          {enrolledCourses.length === 0 ? (

            <p>
              No course enrollments available.
            </p>

          ) : (

            enrolledCourses.map((course) => (

              <div
                className="report-course"
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
                    Progress:
                  </strong>{" "}
                  {course.progress || 0}%
                </p>

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

              </div>

            ))

          )}

        </div>


        {/* Student Report */}

        <div className="report-section">

          <h2>👨‍🎓 Student Report</h2>

          {student ? (

            <div className="student-report">

              <p>
                <strong>Name:</strong>{" "}
                {student.name}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {student.email}
              </p>

              <p>
                <strong>Department:</strong>{" "}
                {student.department}
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

          ) : (

            <p>
              No registered students available.
            </p>

          )}

        </div>


        {/* Back Button */}

        <button
          className="dashboard-button"
          onClick={() =>
            navigate("/admin-dashboard")
          }
        >
          ← Back to Admin Dashboard
        </button>

      </main>

      <Footer />
    </>
  );
}

export default AdminReports;