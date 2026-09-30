import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function AdminStudents() {

  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {

    const adminLoggedIn =
      localStorage.getItem("adminLoggedIn");

    if (adminLoggedIn !== "true") {

      alert("Please login as Admin");

      navigate("/admin-login");

      return;
    }

    loadStudents();

  }, [navigate]);


  function loadStudents() {

    const savedStudent =
      JSON.parse(
        localStorage.getItem("student")
      );

    const enrolledCourses =
      JSON.parse(
        localStorage.getItem("enrolledCourses")
      ) || [];


    if (savedStudent) {

      const studentData = {
        ...savedStudent,
        enrolledCourses: enrolledCourses
      };

      setStudents([studentData]);

    } else {

      setStudents([]);

    }
  }


  // Search students
  const filteredStudents =
    students.filter((student) => {

      const searchText =
        search.toLowerCase();

      return (
        student.name
          ?.toLowerCase()
          .includes(searchText) ||

        student.email
          ?.toLowerCase()
          .includes(searchText) ||

        student.department
          ?.toLowerCase()
          .includes(searchText)
      );

    });


  return (
    <>
      <Navbar />

      <main className="admin-students-page">

        <h1>👨‍🎓 Student Management</h1>

        <p>
          View and monitor registered students.
        </p>


        {/* Search */}

        <div className="student-search">

          <input
            type="text"
            placeholder="Search by name, email or department..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>


        {/* Student List */}

        <div className="student-list">

          <h2>
            📋 Registered Students
          </h2>


          {filteredStudents.length === 0 ? (

            <div className="empty-students">

              <p>
                No students found.
              </p>

            </div>

          ) : (

            filteredStudents.map((student) => (

              <div
                className="student-card"
                key={student.email}
              >

                <h3>
                  👤 {student.name}
                </h3>

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


                {/* Enrolled Courses */}

                <div className="student-enrollments">

                  <h4>
                    📚 Enrolled Courses
                  </h4>


                  {student.enrolledCourses.length === 0 ? (

                    <p>
                      No courses enrolled.
                    </p>

                  ) : (

                    student.enrolledCourses.map(
                      (course) => (

                        <div
                          className="student-course"
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

                        </div>

                      )
                    )

                  )}

                </div>

              </div>

            ))

          )}

        </div>


        {/* Back */}

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

export default AdminStudents;