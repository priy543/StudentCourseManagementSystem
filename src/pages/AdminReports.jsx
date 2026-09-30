import { useCallback, useEffect, useState } from "react";
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


function AdminReports() {

  const navigate = useNavigate();

  const {
    courses,
    loading: coursesLoading,
    error: coursesError
  } = useCourses();


  const [students, setStudents] =
    useState([]);

  const [enrollments, setEnrollments] =
    useState([]);


  // =====================================================
  // LOAD STUDENTS + ENROLLMENTS
  // =====================================================

  const loadReportData = useCallback(() => {

    const studentData =
      getStudents();


    const safeStudents =
      Array.isArray(studentData)
        ? studentData
        : [];


    setStudents(safeStudents);


    const allEnrollments = [];


    safeStudents.forEach(
      (student) => {

        const studentCourses =
          getEnrolledCourses(
            student.email
          );


        if (
          !Array.isArray(studentCourses)
        ) {
          return;
        }


        studentCourses.forEach(
          (course) => {

            allEnrollments.push({

              ...course,

              studentName:
                student.name ||
                "Unnamed Student",

              studentEmail:
                student.email ||
                "No email",

              courseName:
                course.name ||
                course.courseName ||
                "Unnamed Course",

              progress:
                Math.min(
                  100,
                  Math.max(
                    0,
                    Number(
                      course.progress || 0
                    )
                  )
                )

            });

          }
        );

      }
    );


    setEnrollments(
      allEnrollments
    );

  }, []);


  // =====================================================
  // ADMIN PROTECTION + LOAD REPORT DATA
  // =====================================================

  useEffect(() => {

    if (!isAdminLoggedIn()) {

      showError(
        "Please login as admin first."
      );

      navigate("/admin-login");

      return;

    }

    loadReportData();

  }, [navigate, loadReportData]);


  // =====================================================
  // BASIC STATISTICS
  // =====================================================

  const totalStudents =
    students.length;


  const totalCourses =
    courses.length;


  const totalEnrollments =
    enrollments.length;


  // =====================================================
  // PROGRESS STATISTICS
  // =====================================================

  const completedEnrollments =
    enrollments.filter(
      (item) =>
        Number(
          item.progress || 0
        ) === 100
    );


  const inProgressEnrollments =
    enrollments.filter(
      (item) => {

        const progress =
          Number(
            item.progress || 0
          );


        return (
          progress > 0 &&
          progress < 100
        );

      }
    );


  const notStartedEnrollments =
    enrollments.filter(
      (item) =>
        Number(
          item.progress || 0
        ) === 0
    );


  const averageProgress =
    totalEnrollments > 0
      ? Math.round(
          enrollments.reduce(
            (
              total,
              item
            ) =>
              total +
              Number(
                item.progress || 0
              ),
            0
          ) /
          totalEnrollments
        )
      : 0;


  // =====================================================
  // COURSE-WISE REPORT
  // =====================================================

  const courseReports =
    courses.map(
      (course) => {

        const courseEnrollments =
          enrollments.filter(
            (item) =>
              String(item.id) ===
              String(course.id)
          );


        const courseProgress =
          courseEnrollments.length > 0
            ? Math.round(
                courseEnrollments.reduce(
                  (
                    total,
                    item
                  ) =>
                    total +
                    Number(
                      item.progress || 0
                    ),
                  0
                ) /
                courseEnrollments.length
              )
            : 0;


        return {

          ...course,

          courseName:
            course.courseName ||
            course.name ||
            "Unnamed Course",

          enrollmentCount:
            courseEnrollments.length,

          averageProgress:
            courseProgress

        };

      }
    );


  // =====================================================
  // STUDENT-WISE REPORT
  // =====================================================

  const studentReports =
    students.map(
      (student) => {

        const studentEnrollments =
          enrollments.filter(
            (item) =>
              item.studentEmail ===
              student.email
          );


        const studentProgress =
          studentEnrollments.length > 0
            ? Math.round(
                studentEnrollments.reduce(
                  (
                    total,
                    item
                  ) =>
                    total +
                    Number(
                      item.progress || 0
                    ),
                  0
                ) /
                studentEnrollments.length
              )
            : 0;


        return {

          ...student,

          studentName:
            student.name ||
            "Unnamed Student",

          studentEmail:
            student.email ||
            "No email",

          enrollmentCount:
            studentEnrollments.length,

          averageProgress:
            studentProgress

        };

      }
    );


  // =====================================================
  // STATUS
  // =====================================================

  function getStatus(progress) {

    const value =
      Number(
        progress || 0
      );


    if (value === 100) {

      return {
        label: "Completed",
        className: "report-status completed"
      };

    }


    if (value > 0) {

      return {
        label: "In Progress",
        className: "report-status progress"
      };

    }


    return {
      label: "Not Started",
      className: "report-status not-started"
    };

  }


  // =====================================================
  // PERCENTAGE
  // =====================================================

  function getPercentage(value) {

    if (totalEnrollments === 0) {
      return 0;
    }


    return Math.round(
      (value / totalEnrollments) * 100
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

    <div className="admin-page admin-reports-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="admin-header">

        <div>

          <span className="admin-page-label">
            ADMINISTRATION PANEL
          </span>


          <h1>
            Reports & Analytics
          </h1>


          <p>
            Monitor student enrollment,
            course activity and learning progress.
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


        <Link to="/admin-students">
          Students
        </Link>


        <Link
          to="/admin-reports"
          className="active"
        >
          Reports
        </Link>

      </nav>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="admin-content">


        {/* =================================================
            TITLE
        ================================================= */}

        <div className="admin-section-header">

          <div>

            <span className="section-mini-label">
              PERFORMANCE OVERVIEW
            </span>


            <h2>
              Learning Analytics
            </h2>


            <p>
              A complete overview of
              platform activity and progress.
            </p>

          </div>

        </div>


        {/* =================================================
            LOADING / ERROR
        ================================================= */}

        {coursesLoading && (

          <div className="report-message">

            <div>
              📊
            </div>

            <h3>
              Loading report data...
            </h3>

            <p>
              Please wait while the course
              data is loaded.
            </p>

          </div>

        )}


        {coursesError && (

          <div className="report-message report-error">

            <div>
              ⚠️
            </div>

            <h3>
              Course Data Unavailable
            </h3>

            <p>
              {coursesError}
            </p>

          </div>

        )}


        {/* =================================================
            SUMMARY STATISTICS
        ================================================= */}

        {!coursesLoading && (

          <section className="report-stats">


            <div className="report-stat-card">

              <div className="report-stat-icon">
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


            <div className="report-stat-card">

              <div className="report-stat-icon">
                📚
              </div>

              <div>

                <span>
                  TOTAL COURSES
                </span>

                <strong>
                  {totalCourses}
                </strong>

                <p>
                  Available courses
                </p>

              </div>

            </div>


            <div className="report-stat-card">

              <div className="report-stat-icon">
                📝
              </div>

              <div>

                <span>
                  ENROLLMENTS
                </span>

                <strong>
                  {totalEnrollments}
                </strong>

                <p>
                  Course enrollments
                </p>

              </div>

            </div>


            <div className="report-stat-card">

              <div className="report-stat-icon">
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
                  Overall learning progress
                </p>

              </div>

            </div>


          </section>

        )}


        {/* =================================================
            PROGRESS STATUS CARDS
        ================================================= */}

        {!coursesLoading && (

          <section className="report-status-grid">


            <div className="status-summary-card completed-card">

              <div className="status-summary-icon">
                ✓
              </div>

              <div>

                <span>
                  COMPLETED
                </span>

                <strong>
                  {completedEnrollments.length}
                </strong>

                <small>
                  {getPercentage(
                    completedEnrollments.length
                  )}% of enrollments
                </small>

              </div>

            </div>


            <div className="status-summary-card progress-card">

              <div className="status-summary-icon">
                ↗
              </div>

              <div>

                <span>
                  IN PROGRESS
                </span>

                <strong>
                  {inProgressEnrollments.length}
                </strong>

                <small>
                  {getPercentage(
                    inProgressEnrollments.length
                  )}% of enrollments
                </small>

              </div>

            </div>


            <div className="status-summary-card pending-card">

              <div className="status-summary-icon">
                ○
              </div>

              <div>

                <span>
                  NOT STARTED
                </span>

                <strong>
                  {notStartedEnrollments.length}
                </strong>

                <small>
                  {getPercentage(
                    notStartedEnrollments.length
                  )}% of enrollments
                </small>

              </div>

            </div>


          </section>

        )}


        {/* =================================================
            ENROLLMENT STATUS
        ================================================= */}

        <section className="report-section">


          <div className="report-section-header">

            <div>

              <span className="section-mini-label">
                ENROLLMENT BREAKDOWN
              </span>

              <h2>
                📌 Enrollment Status
              </h2>

            </div>

          </div>


          <div className="report-table-container">

            <table className="report-table">

              <thead>

                <tr>

                  <th>
                    Status
                  </th>

                  <th>
                    Enrollments
                  </th>

                  <th>
                    Percentage
                  </th>

                  <th>
                    Distribution
                  </th>

                </tr>

              </thead>


              <tbody>

                <tr>

                  <td>
                    <span className="table-status completed">
                      ✓ Completed
                    </span>
                  </td>

                  <td>
                    <strong>
                      {completedEnrollments.length}
                    </strong>
                  </td>

                  <td>
                    {getPercentage(
                      completedEnrollments.length
                    )}%
                  </td>

                  <td>

                    <div className="table-distribution">

                      <div className="distribution-bar">

                        <div
                          className="distribution-fill completed-fill"
                          style={{
                            width:
                              `${getPercentage(
                                completedEnrollments.length
                              )}%`
                          }}
                        />

                      </div>

                    </div>

                  </td>

                </tr>


                <tr>

                  <td>
                    <span className="table-status progress">
                      ↗ In Progress
                    </span>
                  </td>

                  <td>
                    <strong>
                      {inProgressEnrollments.length}
                    </strong>
                  </td>

                  <td>
                    {getPercentage(
                      inProgressEnrollments.length
                    )}%
                  </td>

                  <td>

                    <div className="table-distribution">

                      <div className="distribution-bar">

                        <div
                          className="distribution-fill progress-fill-report"
                          style={{
                            width:
                              `${getPercentage(
                                inProgressEnrollments.length
                              )}%`
                          }}
                        />

                      </div>

                    </div>

                  </td>

                </tr>


                <tr>

                  <td>
                    <span className="table-status not-started">
                      ○ Not Started
                    </span>
                  </td>

                  <td>
                    <strong>
                      {notStartedEnrollments.length}
                    </strong>
                  </td>

                  <td>
                    {getPercentage(
                      notStartedEnrollments.length
                    )}%
                  </td>

                  <td>

                    <div className="table-distribution">

                      <div className="distribution-bar">

                        <div
                          className="distribution-fill pending-fill"
                          style={{
                            width:
                              `${getPercentage(
                                notStartedEnrollments.length
                              )}%`
                          }}
                        />

                      </div>

                    </div>

                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </section>


        {/* =================================================
            COURSE-WISE REPORT
        ================================================= */}

        <section className="report-section">


          <div className="report-section-header">

            <div>

              <span className="section-mini-label">
                COURSE PERFORMANCE
              </span>

              <h2>
                📚 Course-wise Analytics
              </h2>

              <p>
                Enrollment and average progress
                for each course.
              </p>

            </div>

          </div>


          {courseReports.length === 0 ? (

            <div className="report-empty">

              <span>
                📚
              </span>

              <h3>
                No Courses Available
              </h3>

              <p>
                Add courses from Course Management
                to see course analytics.
              </p>

            </div>

          ) : (

            <div className="report-table-container">

              <table className="report-table">

                <thead>

                  <tr>

                    <th>
                      Course
                    </th>

                    <th>
                      Instructor
                    </th>

                    <th>
                      Duration
                    </th>

                    <th>
                      Enrollments
                    </th>

                    <th>
                      Average Progress
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {courseReports.map(
                    (course) => (

                      <tr
                        key={course.id}
                      >

                        <td>

                          <div className="course-report-name">

                            <div className="course-report-icon">
                              📚
                            </div>

                            <div>

                              <strong>
                                {course.courseName}
                              </strong>

                              <span>
                                {course.courseCode ||
                                  "No code"}
                              </span>

                            </div>

                          </div>

                        </td>


                        <td>
                          {course.instructor ||
                            "Not specified"}
                        </td>


                        <td>
                          {course.duration ||
                            "Not specified"}
                        </td>


                        <td>

                          <span className="enrollment-count">
                            {course.enrollmentCount}
                          </span>

                        </td>


                        <td>

                          <div className="report-progress">

                            <div className="report-progress-header">

                              <span>
                                {course.averageProgress}%
                              </span>

                            </div>


                            <div className="report-progress-bar">

                              <div
                                className="report-progress-fill"
                                style={{
                                  width:
                                    `${course.averageProgress}%`
                                }}
                              />

                            </div>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* =================================================
            STUDENT-WISE REPORT
        ================================================= */}

        <section className="report-section">


          <div className="report-section-header">

            <div>

              <span className="section-mini-label">
                LEARNER PERFORMANCE
              </span>

              <h2>
                👨‍🎓 Student-wise Progress
              </h2>

              <p>
                Individual enrollment and
                learning progress.
              </p>

            </div>

          </div>


          {studentReports.length === 0 ? (

            <div className="report-empty">

              <span>
                👨‍🎓
              </span>

              <h3>
                No Students Registered
              </h3>

              <p>
                Student reports will appear
                after students register.
              </p>

            </div>

          ) : (

            <div className="report-table-container">

              <table className="report-table">

                <thead>

                  <tr>

                    <th>
                      Student
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Department
                    </th>

                    <th>
                      Enrollments
                    </th>

                    <th>
                      Average Progress
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {studentReports.map(
                    (student) => (

                      <tr
                        key={
                          student.id ||
                          student.studentEmail
                        }
                      >

                        <td>

                          <div className="student-report-name">

                            <div className="student-report-avatar">

                              {(
                                student.studentName ||
                                "S"
                              )
                                .charAt(0)
                                .toUpperCase()}

                            </div>

                            <strong>
                              {student.studentName}
                            </strong>

                          </div>

                        </td>


                        <td>
                          {student.studentEmail}
                        </td>


                        <td>
                          {student.department ||
                            "Not specified"}
                        </td>


                        <td>

                          <span className="enrollment-count">
                            {student.enrollmentCount}
                          </span>

                        </td>


                        <td>

                          <div className="report-progress">

                            <div className="report-progress-header">

                              <span>
                                {student.averageProgress}%
                              </span>

                            </div>


                            <div className="report-progress-bar">

                              <div
                                className="report-progress-fill"
                                style={{
                                  width:
                                    `${student.averageProgress}%`
                                }}
                              />

                            </div>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* =================================================
            ENROLLMENT DETAILS
        ================================================= */}

        <section className="report-section">


          <div className="report-section-header">

            <div>

              <span className="section-mini-label">
                ENROLLMENT DATABASE
              </span>

              <h2>
                📝 Enrollment Details
              </h2>

              <p>
                Detailed view of every student
                course enrollment.
              </p>

            </div>

          </div>


          {enrollments.length === 0 ? (

            <div className="report-empty">

              <span>
                📝
              </span>

              <h3>
                No Enrollments Available
              </h3>

              <p>
                Enrollment records will appear
                when students join courses.
              </p>

            </div>

          ) : (

            <div className="report-table-container">

              <table className="report-table">

                <thead>

                  <tr>

                    <th>
                      Student
                    </th>

                    <th>
                      Course
                    </th>

                    <th>
                      Progress
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {enrollments.map(
                    (enrollment, index) => {

                      const status =
                        getStatus(
                          enrollment.progress
                        );


                      return (

                        <tr
                          key={
                            `${enrollment.studentEmail}-${enrollment.id}-${index}`
                          }
                        >

                          <td>

                            <div className="enrollment-student">

                              <div className="mini-avatar">

                                {(
                                  enrollment.studentName ||
                                  "S"
                                )
                                  .charAt(0)
                                  .toUpperCase()}

                              </div>

                              <div>

                                <strong>
                                  {enrollment.studentName}
                                </strong>

                                <span>
                                  {enrollment.studentEmail}
                                </span>

                              </div>

                            </div>

                          </td>


                          <td>

                            <strong>
                              {enrollment.courseName}
                            </strong>

                          </td>


                          <td>

                            <div className="report-progress">

                              <div className="report-progress-header">

                                <span>
                                  {enrollment.progress}%
                                </span>

                              </div>


                              <div className="report-progress-bar">

                                <div
                                  className="report-progress-fill"
                                  style={{
                                    width:
                                      `${enrollment.progress}%`
                                  }}
                                />

                              </div>

                            </div>

                          </td>


                          <td>

                            <span
                              className={
                                status.className
                              }
                            >
                              {status.label}
                            </span>

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

        <section className="admin-report-actions">

          <div>

            <span className="section-mini-label">
              QUICK ACTIONS
            </span>

            <h2>
              Administration
            </h2>

          </div>


          <div className="report-action-buttons">

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
                  "/admin-students"
                )
              }
            >
              👨‍🎓 Students
            </button>

          </div>

        </section>


      </main>

    </div>

  );

}


export default AdminReports;