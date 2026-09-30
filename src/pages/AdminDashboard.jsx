import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  isAdminLoggedIn,
  logoutAdmin
} from "../modules/auth";

import {
  getAllStudents,
  getAllEnrollments
} from "../modules/api";

import { showError, showSuccess } from "../modules/ui";

import { useCourses } from "../context/CourseContext";


function AdminDashboard() {

  const navigate = useNavigate();
  const adminAuthorized = isAdminLoggedIn();

  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
    fetchCourses
  } = useCourses();

  const [students] = useState(() => {
    if (!adminAuthorized) {
      return [];
    }

    try {
      const studentData = getAllStudents();
      return Array.isArray(studentData) ? studentData : [];
    } catch (error) {
      console.error("Student loading error:", error);
      return [];
    }
  });

  const [enrollments] = useState(() => {
    if (!adminAuthorized) {
      return [];
    }

    try {
      const enrollmentData = getAllEnrollments();
      return Array.isArray(enrollmentData) ? enrollmentData : [];
    } catch (error) {
      console.error("Enrollment loading error:", error);
      return [];
    }
  });


  useEffect(() => {

    if (!adminAuthorized) {

      showError("Please login as admin first.");

      navigate("/admin-login");

      return;
    }


    fetchCourses();

  }, [navigate, fetchCourses, adminAuthorized]);


  function handleLogout() {

    logoutAdmin();

    showSuccess(
      "Admin logged out successfully."
    );

    navigate("/admin-login");

  }


  const totalStudents =
    students.length;

  const totalCourses =
    courses.length;

  const totalEnrollments =
    enrollments.length;


  const averageProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce(
            (total, enrollment) =>
              total +
              Number(
                enrollment.progress || 0
              ),
            0
          ) / enrollments.length
        )
      : 0;

  if (!adminAuthorized) {
    return null;
  }


  return (
    <>
      <Navbar />

      <main className="admin-dashboard-modern">


        {/* ================= HEADER ================= */}

        <section className="admin-welcome">

          <div className="admin-welcome-content">

            <span className="admin-badge">
              ADMIN PANEL
            </span>

            <h1>
              Dashboard Overview
            </h1>

            <p>
              Monitor courses, students,
              enrollments and learning progress
              from one place.
            </p>

          </div>


          <button
            className="admin-modern-logout"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>

        </section>



        {/* ================= STATISTICS ================= */}

        <section className="admin-modern-stats">


          <div className="modern-stat-card">

            <div className="stat-icon">
              👨‍🎓
            </div>

            <div className="stat-content">

              <span>
                Total Students
              </span>

              <strong>
                {totalStudents}
              </strong>

              <small>
                Registered students
              </small>

            </div>

          </div>



          <div className="modern-stat-card">

            <div className="stat-icon">
              📚
            </div>

            <div className="stat-content">

              <span>
                Total Courses
              </span>

              <strong>
                {coursesLoading
                  ? "..."
                  : totalCourses}
              </strong>

              <small>
                Available courses
              </small>

            </div>

          </div>



          <div className="modern-stat-card">

            <div className="stat-icon">
              📝
            </div>

            <div className="stat-content">

              <span>
                Enrollments
              </span>

              <strong>
                {totalEnrollments}
              </strong>

              <small>
                Active enrollments
              </small>

            </div>

          </div>



          <div className="modern-stat-card">

            <div className="stat-icon">
              📈
            </div>

            <div className="stat-content">

              <span>
                Average Progress
              </span>

              <strong>
                {averageProgress}%
              </strong>

              <small>
                Overall learning progress
              </small>

            </div>

          </div>


        </section>



        {/* ================= ERROR ================= */}

        {coursesError && (

          <div className="admin-api-error">

            <div>

              <strong>
                Unable to load courses
              </strong>

              <p>
                {coursesError}
              </p>

            </div>

            <button
              onClick={fetchCourses}
            >
              Try Again
            </button>

          </div>

        )}



        {/* ================= MANAGEMENT ================= */}

        <section className="admin-modern-section">

          <div className="admin-section-title">

            <div>

              <span>
                ADMINISTRATION
              </span>

              <h2>
                Quick Management
              </h2>

            </div>

          </div>


          <div className="admin-management-modern">


            <div className="management-modern-card">

              <div className="management-icon">
                📚
              </div>

              <div>

                <h3>
                  Course Management
                </h3>

                <p>
                  Add, edit, delete and manage
                  learning courses.
                </p>

              </div>

              <Link to="/admin-courses">
                Manage Courses →
              </Link>

            </div>



            <div className="management-modern-card">

              <div className="management-icon">
                👨‍🎓
              </div>

              <div>

                <h3>
                  Student Management
                </h3>

                <p>
                  View students and their
                  enrollment information.
                </p>

              </div>

              <Link to="/admin-students">
                Manage Students →
              </Link>

            </div>



            <div className="management-modern-card">

              <div className="management-icon">
                📊
              </div>

              <div>

                <h3>
                  Reports & Analytics
                </h3>

                <p>
                  Analyze enrollments and
                  learning progress.
                </p>

              </div>

              <Link to="/admin-reports">
                View Reports →
              </Link>

            </div>


          </div>

        </section>



        {/* ================= COURSES ================= */}

        <section className="admin-modern-section">

          <div className="admin-section-title">

            <div>

              <span>
                LEARNING PLATFORM
              </span>

              <h2>
                Course Overview
              </h2>

            </div>

            <Link
              to="/admin-courses"
              className="view-all-link"
            >
              Manage Courses →
            </Link>

          </div>


          {coursesLoading ? (

            <div className="admin-loading">
              Loading courses...
            </div>

          ) : courses.length === 0 ? (

            <div className="admin-empty">
              No courses available.
            </div>

          ) : (

            <div className="admin-modern-course-grid">

              {courses.map((course) => (

                <div
                  className="modern-course-card"
                  key={course.id}
                >

                  <div className="modern-course-image">

                    {course.image ? (

                      <img
                        src={course.image}
                        alt={course.courseName}
                      />

                    ) : (

                      <div className="course-image-placeholder">
                        📚
                      </div>

                    )}

                  </div>


                  <div className="modern-course-content">

                    <div className="course-top-row">

                      <span className="course-code">
                        {course.courseCode}
                      </span>

                      <span
                        className={
                          course.status === "Active"
                            ? "course-active"
                            : "course-inactive"
                        }
                      >
                        {course.status}
                      </span>

                    </div>


                    <h3>
                      {course.courseName}
                    </h3>


                    <p className="course-description">
                      {course.overview}
                    </p>


                    <div className="course-info">

                      <span>
                        👨‍🏫{" "}
                        {course.instructor}
                      </span>

                      <span>
                        ⏱️{" "}
                        {course.duration}
                      </span>

                    </div>


                    <div className="course-footer">

                      <span>
                        {course.level}
                      </span>

                      <span>
                        {course.category}
                      </span>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>



        {/* ================= RECENT ENROLLMENTS ================= */}

        <section className="admin-modern-section">

          <div className="admin-section-title">

            <div>

              <span>
                STUDENT ACTIVITY
              </span>

              <h2>
                Recent Enrollments
              </h2>

            </div>

          </div>


          {enrollments.length === 0 ? (

            <div className="admin-empty">
              No student enrollments yet.
            </div>

          ) : (

            <div className="modern-enrollment-list">

              {enrollments
                .slice(-5)
                .reverse()
                .map(
                  (
                    enrollment,
                    index
                  ) => (

                    <div
                      className="modern-enrollment-card"
                      key={`${enrollment.studentEmail}-${enrollment.courseId}-${index}`}
                    >

                      <div className="student-avatar">
                        👤
                      </div>


                      <div className="enrollment-main">

                        <h3>
                          {enrollment.courseName}
                        </h3>

                        <p>
                          {enrollment.studentName}
                        </p>

                        <small>
                          {enrollment.studentEmail}
                        </small>

                      </div>


                      <div className="enrollment-progress">

                        <span>
                          Progress
                        </span>

                        <strong>
                          {enrollment.progress || 0}%
                        </strong>

                      </div>

                    </div>

                  )
                )}

            </div>

          )}

        </section>



        {/* ================= SUMMARY ================= */}

        <section className="admin-summary-modern">

          <div>

            <span>
              SYSTEM SUMMARY
            </span>

            <h2>
              Learning Platform Status
            </h2>

          </div>


          <div className="summary-modern-grid">

            <div>
              <strong>
                {totalStudents}
              </strong>

              <span>
                Students
              </span>
            </div>


            <div>
              <strong>
                {totalCourses}
              </strong>

              <span>
                Courses
              </span>
            </div>


            <div>
              <strong>
                {totalEnrollments}
              </strong>

              <span>
                Enrollments
              </span>
            </div>


            <div>
              <strong>
                {averageProgress}%
              </strong>

              <span>
                Avg. Progress
              </span>
            </div>

          </div>

        </section>


      </main>

      <Footer />

    </>
  );
}


export default AdminDashboard;