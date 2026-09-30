import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getStudents,
  isAdminLoggedIn,
  logoutAdmin
} from "../modules/auth";

import {
  getEnrolledCourses
} from "../modules/api";

import {
  showError
} from "../modules/ui";

import { useCourses } from "../context/CourseContext";


function AdminStudents() {

  const navigate = useNavigate();
  const { courses } = useCourses();

  const [students, setStudents] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedDepartment, setSelectedDepartment] =
    useState("all");

  const [selectedStatus, setSelectedStatus] =
    useState("all");

  const [sortBy, setSortBy] =
    useState("name-asc");

  const [selectedStudent, setSelectedStudent] =
    useState(null);


  // =====================================================
  // ADMIN PROTECTION
  // =====================================================

  useEffect(() => {

    if (!isAdminLoggedIn()) {

      showError(
        "Please login as admin first."
      );

      navigate("/admin-login");

      return;
    }

    loadStudents();

  }, [navigate]);


  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  function loadStudents() {

    const studentData =
      getStudents();

    const safeStudents =
      Array.isArray(studentData)
        ? studentData
        : [];

    const studentsWithEnrollments = safeStudents.map((student) => {
      const { password: _password, ...studentDetails } = student;
      const enrolledCourses = getEnrolledCourses(student.email);

      return {
        ...studentDetails,
        enrolledCourses: Array.isArray(enrolledCourses)
          ? enrolledCourses
          : []
      };
    });


    setStudents(
      studentsWithEnrollments
    );

  }


  // =====================================================
  // DEPARTMENTS
  // =====================================================

  const departments = useMemo(
    () =>
      [...new Set(
        students
          .map((student) => student.department?.trim())
          .filter(Boolean)
      )].sort((first, second) => first.localeCompare(second)),
    [students]
  );

  const coursesById = useMemo(
    () => new Map(courses.map((course) => [String(course.id), course])),
    [courses]
  );

  const studentsWithDetails = useMemo(
    () =>
      students.map((student) => {
        const enrolledCourses = student.enrolledCourses.map((enrolledCourse) => {
          const catalogCourse = coursesById.get(String(enrolledCourse.id));
          const savedProgress = Number(enrolledCourse.progress || 0);
          const progress = Number.isFinite(savedProgress)
            ? Math.min(100, Math.max(0, savedProgress))
            : 0;

          return {
            ...enrolledCourse,
            ...(catalogCourse || {}),
            id: enrolledCourse.id,
            courseName:
              catalogCourse?.courseName ||
              enrolledCourse.courseName ||
              enrolledCourse.name ||
              "Unnamed Course",
            courseCode:
              catalogCourse?.courseCode ||
              enrolledCourse.courseCode ||
              "Course",
            instructor:
              catalogCourse?.instructor ||
              enrolledCourse.instructor ||
              "Instructor unavailable",
            category:
              catalogCourse?.category ||
              enrolledCourse.category ||
              "Category unavailable",
            duration:
              catalogCourse?.duration ||
              enrolledCourse.duration ||
              "Duration unavailable",
            level:
              catalogCourse?.level ||
              enrolledCourse.level ||
              "Level unavailable",
            catalogMissing: !catalogCourse,
            progress
          };
        });

        const averageProgress = enrolledCourses.length > 0
          ? Math.round(
              enrolledCourses.reduce(
                (total, course) => total + course.progress,
                0
              ) / enrolledCourses.length
            )
          : 0;
        const allCompleted = enrolledCourses.length > 0 &&
          enrolledCourses.every((course) => course.progress === 100);
        const allNotStarted = enrolledCourses.length > 0 &&
          enrolledCourses.every((course) => course.progress === 0);
        const learningStatus = enrolledCourses.length === 0
          ? "Not Enrolled"
          : allCompleted
          ? "Completed"
          : allNotStarted
          ? "Not Started"
          : "In Progress";

        return {
          ...student,
          enrolledCourses,
          enrollmentCount: enrolledCourses.length,
          averageProgress,
          learningStatus,
          hasCompletedCourse: enrolledCourses.some(
            (course) => course.progress === 100
          )
        };
      }),
    [students, coursesById]
  );


  // =====================================================
  // FILTER STUDENTS
  // =====================================================

  const filteredStudents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const matchingStudents = studentsWithDetails.filter((student) => {
      const matchesSearch = !search || [
        student.name,
        student.email,
        student.department,
        student.course,
        ...student.enrolledCourses.map((course) => course.courseName)
      ].some((value) => String(value || "").toLowerCase().includes(search));

      return (
        matchesSearch &&
        (selectedDepartment === "all" || student.department === selectedDepartment) &&
        (selectedStatus === "all" || student.learningStatus === selectedStatus)
      );
    });

    return matchingStudents.sort((first, second) => {
      if (sortBy === "name-asc" || sortBy === "name-desc") {
        const comparison = String(first.name || "").localeCompare(
          String(second.name || ""),
          undefined,
          { sensitivity: "base" }
        );

        return sortBy === "name-asc" ? comparison : -comparison;
      }

      const firstValue = sortBy.startsWith("progress")
        ? first.averageProgress
        : first.enrollmentCount;
      const secondValue = sortBy.startsWith("progress")
        ? second.averageProgress
        : second.enrollmentCount;
      const comparison = firstValue - secondValue;

      return sortBy.endsWith("asc") ? comparison : -comparison;
    });
  }, [
    studentsWithDetails,
    searchTerm,
    selectedDepartment,
    selectedStatus,
    sortBy
  ]);


  // =====================================================
  // STATISTICS
  // =====================================================

  const totalStudents =
    students.length;


  const activeStudents = studentsWithDetails.filter(
    (student) => student.enrollmentCount > 0
  ).length;


  const studentsWithCompletedCourses =
    studentsWithDetails.filter(
      (student) => student.hasCompletedCourse
    ).length;

  const studentsWithoutEnrollment = studentsWithDetails.filter(
    (student) => student.enrollmentCount === 0
  ).length;


  const averageProgress =
    students.length > 0
      ? Math.round(
          studentsWithDetails.reduce(
            (
              total,
              student
            ) =>
              total +
              Number(
                student.averageProgress || 0
              ),
            0
          ) /
          students.length
        )
        : 0;



  // =====================================================
  // PROGRESS STATUS
  // =====================================================

  function getProgressStatus(
    progress
  ) {

    const value =
      Number(
        progress || 0
      );


    if (value === 100) {

      return {
        label: "Completed",
        className:
          "student-status completed"
      };

    }


    if (value > 0) {

      return {
        label: "In Progress",
        className:
          "student-status learning"
      };

    }


    return {
      label: "Not Started",
      className:
        "student-status not-started"
    };

  }


  // =====================================================
  // VIEW STUDENT
  // =====================================================

  function handleViewStudent(
    student
  ) {

    setSelectedStudent(
      student
    );

  }


  // =====================================================
  // CLOSE DETAILS
  // =====================================================

  function closeDetails() {

    setSelectedStudent(
      null
    );

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {

    logoutAdmin();

    navigate(
      "/admin-login"
    );

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="admin-page admin-students-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="admin-header">

        <div>

          <span className="admin-page-label">
            ADMINISTRATION PANEL
          </span>


          <h1>
            Student Management
          </h1>


          <p>
            Review student accounts, enrollment status and learning progress.
          </p>

        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </header>


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="admin-navigation">

        <Link to="/admin-dashboard">
          Dashboard
        </Link>


        <Link to="/admin-courses">
          Courses
        </Link>


        <Link
          to="/admin-students"
          className="active"
        >
          Students
        </Link>


        <Link to="/admin-reports">
          Reports
        </Link>

      </nav>


      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="admin-content">


        {/* =================================================
            PAGE INTRO
        ================================================= */}

        <div className="admin-section-header">

          <div>

            <span className="section-mini-label">
              LEARNER MANAGEMENT
            </span>


            <h2>
              Registered Students
            </h2>


            <p>
              Monitor student activity and
              course learning progress.
            </p>

          </div>

        </div>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="student-stats">


          <div className="student-stat-card">

            <div className="student-stat-icon">
              👨‍🎓
            </div>

            <div>

              <span>
                TOTAL STUDENTS
              </span>

              <strong>
                {totalStudents}
              </strong>

              <p>
                Registered learners
              </p>

            </div>

          </div>


          <div className="student-stat-card">

            <div className="student-stat-icon">
              📚
            </div>

            <div>

              <span>
                ACTIVE LEARNERS
              </span>

              <strong>
                {activeStudents}
              </strong>

              <p>
                Students with enrollments
              </p>

            </div>

          </div>


          <div className="student-stat-card">

            <div className="student-stat-icon">
              ✅
            </div>

            <div>

              <span>
                STUDENTS WITH COMPLETED COURSES
              </span>

              <strong>
                {studentsWithCompletedCourses}
              </strong>

              <p>
                Students with completed courses
              </p>

            </div>

          </div>


          <div className="student-stat-card">

            <div className="student-stat-icon">
              ◌
            </div>

            <div>
              <span>STUDENTS WITH NO ENROLLMENT</span>
              <strong>{studentsWithoutEnrollment}</strong>
              <p>Registered students not enrolled yet</p>
            </div>

          </div>


          <div className="student-stat-card">

            <div className="student-stat-icon">
              📈
            </div>

            <div>

              <span>
                AVERAGE PROGRESS
              </span>

              <strong>
                {averageProgress}%
              </strong>

              <p>
                Across all students
              </p>

            </div>

          </div>


        </section>


        {/* =================================================
            SEARCH & FILTER
        ================================================= */}

        <section className="student-filter-card">


          <div className="student-search">

            <label htmlFor="admin-student-search">
              Search students
            </label>


            <div className="search-input-wrapper">

              <span>
                🔍
              </span>


              <input
                id="admin-student-search"
                type="text"
                placeholder="Name, email, department, or course"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />

            </div>

          </div>


          <div className="student-department-filter">

            <label htmlFor="student-department-filter">
              Department
            </label>


            <select
              id="student-department-filter"
              value={selectedDepartment}
              onChange={(event) =>
                setSelectedDepartment(
                  event.target.value
                )
              }
            >

              <option value="all">All Departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}

            </select>

          </div>


          <div className="student-department-filter">
            <label htmlFor="student-status-filter">Learning status</label>
            <select
              id="student-status-filter"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="Not Enrolled">Not Enrolled</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>


          <div className="student-department-filter">
            <label htmlFor="student-sort">Sort by</label>
            <select
              id="student-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="progress-asc">Progress lowest-highest</option>
              <option value="progress-desc">Progress highest-lowest</option>
              <option value="enrollment-asc">Enrollment count lowest-highest</option>
              <option value="enrollment-desc">Enrollment count highest-lowest</option>
            </select>
          </div>


          <div className="student-result-count">

            <span>
              Showing
            </span>

            <strong>
              {filteredStudents.length}
            </strong>

            <span>
              students
            </span>

          </div>


        </section>


        {/* =================================================
            STUDENT TABLE
        ================================================= */}

        <section className="student-list-section">


          <div className="student-list-header">

            <div>

              <span className="section-mini-label">
                STUDENT DIRECTORY
              </span>

              <h2>
                All Students
              </h2>

            </div>


            <button
              type="button"
              className="refresh-students-btn"
              onClick={loadStudents}
            >
              ↻ Refresh
            </button>

          </div>


          {students.length === 0 ? (

            <div className="student-empty">

              <span>
                👨‍🎓
              </span>

              <h3>
                No Students Registered
              </h3>

              <p>
                Student accounts will appear here after registration.
              </p>

            </div>

          ) : filteredStudents.length === 0 ? (

            <div className="student-empty">
              <span>⌕</span>
              <h3>No Matching Students</h3>
              <p>Try changing your search or filters.</p>
            </div>

          ) : (

            <div className="student-table-container">

              <table className="student-table">

                <thead>

                  <tr>

                    <th>
                      Student
                    </th>

                    <th>
                      Department
                    </th>

                    <th>Course</th>

                    <th>
                      Enrollments
                    </th>

                    <th>
                      Progress
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredStudents.map((student) => {
                      const status = {
                        label: student.learningStatus,
                        className: `student-status ${
                          student.learningStatus === "Completed"
                            ? "completed"
                            : student.learningStatus === "In Progress"
                            ? "learning"
                            : "not-started"
                        }`
                      };


                      return (

                        <tr
                          key={
                            student.id ||
                            student.email
                          }
                        >


                          {/* STUDENT */}

                          <td>

                            <div className="student-table-user">

                              <div className="student-avatar">

                                {(
                                  student.name ||
                                  "S"
                                )
                                  .charAt(0)
                                  .toUpperCase()}

                              </div>


                              <div>

                                <strong>
                                  {
                                    student.name ||
                                    "Unnamed Student"
                                  }
                                </strong>

                                <span>
                                  {
                                    student.email ||
                                    "No email"
                                  }
                                </span>

                              </div>

                            </div>

                          </td>


                          {/* DEPARTMENT */}

                          <td>

                            <span className="department-badge">

                              {
                                student.department ||
                                "Not specified"
                              }

                            </span>

                          </td>


                          <td>
                            {student.course || "Not specified"}
                          </td>


                          {/* ENROLLMENTS */}

                          <td>

                            <span className="student-enrollment-count">

                              {
                                student.enrollmentCount
                              }

                            </span>

                          </td>


                          {/* PROGRESS */}

                          <td>

                            <div className="student-progress">

                              <div className="student-progress-top">

                                <span>
                                  {
                                    student.averageProgress
                                  }%
                                </span>

                              </div>


                              <div className="student-progress-bar">

                                <div
                                  className="student-progress-fill"
                                  style={{
                                    width:
                                      `${student.averageProgress}%`
                                  }}
                                />

                              </div>

                            </div>

                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className={
                                status.className
                              }
                            >
                              {status.label}
                            </span>

                          </td>


                          {/* ACTION */}

                          <td>

                            <button
                              type="button"
                              className="view-student-btn"
                              onClick={() =>
                                handleViewStudent(
                                  student
                                )
                              }
                            >
                              View Profile
                            </button>

                          </td>


                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="admin-student-actions">

          <div>

            <span className="section-mini-label">
              QUICK ACTIONS
            </span>

            <h2>
              Administration
            </h2>

          </div>


          <div className="student-action-buttons">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin-dashboard"
                )
              }
            >
              ← Dashboard
            </button>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin-courses"
                )
              }
            >
              📚 Manage Courses
            </button>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin-reports"
                )
              }
            >
              📊 Reports
            </button>

          </div>

        </section>


      </main>


      {/* =================================================
          STUDENT DETAILS MODAL
      ================================================= */}

      {selectedStudent && (

        <div
          className="student-modal-overlay"
          onClick={closeDetails}
        >

          <div
            className="student-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-details-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            {/* MODAL HEADER */}

            <div className="student-modal-header">

              <div>

                <span className="section-mini-label">
                  STUDENT PROFILE
                </span>

                <h2>
                  <span id="student-details-title">Student Details</span>
                </h2>

              </div>


              <button
                type="button"
                className="student-modal-close"
                onClick={closeDetails}
              >
                ×
              </button>

            </div>


            {/* PROFILE */}

            <div className="student-profile">

              <div className="large-student-avatar">

                {(
                  selectedStudent.name ||
                  "S"
                )
                  .charAt(0)
                  .toUpperCase()}

              </div>


              <div>

                <h3>
                  {
                    selectedStudent.name ||
                    "Unnamed Student"
                  }
                </h3>

                <p>
                  {
                    selectedStudent.email ||
                    "No email"
                  }
                </p>

              </div>

            </div>


            {/* BASIC DETAILS */}

            <div className="student-detail-grid">

              <div>
                <span>STUDENT ID</span>
                <strong>{selectedStudent.id ?? "Not assigned"}</strong>
              </div>

              <div>

                <span>
                  DEPARTMENT
                </span>

                <strong>
                  {
                    selectedStudent.department ||
                    "Not specified"
                  }
                </strong>

              </div>


              <div>

                <span>
                  COURSE
                </span>

                <strong>
                  {
                    selectedStudent.course ||
                    "Not specified"
                  }
                </strong>

              </div>


              <div>

                <span>
                  ENROLLMENTS
                </span>

                <strong>
                  {
                    selectedStudent.enrollmentCount
                  }
                </strong>

              </div>


              <div>

                <span>
                  AVERAGE PROGRESS
                </span>

                <strong>
                  {
                    selectedStudent.averageProgress
                  }%
                </strong>

              </div>

              <div>
                <span>LEARNING STATUS</span>
                <strong>{selectedStudent.learningStatus}</strong>
              </div>

            </div>


            {/* ENROLLED COURSES */}

            <div className="student-modal-courses">

              <div className="modal-subtitle">

                <h3>
                  Enrolled Courses
                </h3>

                <span>
                  {
                    selectedStudent.enrollmentCount
                  } courses
                </span>

              </div>


              {selectedStudent.enrolledCourses?.length === 0 ? (

                <div className="modal-no-courses">

                  <span>
                    📚
                  </span>

                  <p>
                    This student has not enrolled
                    in any courses yet.
                  </p>

                </div>

              ) : (

                <div className="modal-course-list">

                  {selectedStudent.enrolledCourses.map(
                    (course, index) => {

                      const progress =
                        Number(
                          course.progress || 0
                        );


                      const status =
                        getProgressStatus(
                          progress
                        );


                      return (

                        <div
                          className="modal-course-item"
                          key={
                            `${course.id}-${index}`
                          }
                        >

                          <div className="modal-course-info">

                            <div className="modal-course-icon">
                              📚
                            </div>


                            <div>

                              <strong>
                                {
                                  course.name ||
                                  course.courseName ||
                                  "Unnamed Course"
                                }
                              </strong>

                              <span>
                                {
                                  course.courseCode ||
                                  "Course"
                                }
                              </span>

                              <span className="modal-course-metadata">
                                {course.instructor} · {course.category} · {course.level} · {course.duration}
                              </span>

                              {course.catalogMissing && (
                                <small className="modal-course-missing">
                                  Catalog record unavailable; showing saved enrollment details.
                                </small>
                              )}

                            </div>

                          </div>


                          <div className="modal-course-progress">

                            <div>

                              <span>
                                {progress}%
                              </span>

                              <small
                                className={
                                  status.className
                                }
                              >
                                {status.label}
                              </small>

                            </div>


                            <div className="student-progress-bar">

                              <div
                                className="student-progress-fill"
                                style={{
                                  width:
                                    `${progress}%`
                                }}
                              />

                            </div>

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>

              )}

            </div>


            {/* CLOSE */}

            <div className="student-modal-footer">

              <button
                type="button"
                onClick={closeDetails}
              >
                Close
              </button>

            </div>


          </div>

        </div>

      )}

    </div>

  );

}


export default AdminStudents;