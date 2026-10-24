import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  getLoggedInStudent,
  logoutStudent,
  isStudentLoggedIn
} from "../modules/auth";

import {
  getEnrolledCourses,
  getBookmarkedModules
} from "../modules/api";

import { useCourses } from "../context/CourseContext";


function DashboardCourseCard({ course, actionLabel, completed = false }) {
  return (
    <article className="dashboard-course-card">
      <div className="dashboard-course-image">
        {course.image ? (
          <img src={course.image} alt={course.courseName} />
        ) : (
          <span aria-hidden="true">📚</span>
        )}
        <span className="dashboard-course-code">
          {course.courseCode}
        </span>
        {completed && (
          <span className="dashboard-course-complete-badge">
            Completed
          </span>
        )}
      </div>

      <div className="dashboard-course-content">
        <h3>{course.courseName}</h3>
        <p className="dashboard-course-instructor">
          {course.instructor}
        </p>

        {course.catalogMissing && (
          <p className="dashboard-course-unavailable">
            Saved enrollment details shown; this course is no longer in the catalog.
          </p>
        )}

        <div className="dashboard-course-progress">
          <div className="course-progress-header">
            <span>Progress</span>
            <strong>{course.progress}%</strong>
          </div>
          <div
            className="course-progress-bar"
            role="progressbar"
            aria-label={`${course.courseName} progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={course.progress}
          >
            <div
              className="course-progress-fill"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>

        <Link
          to={`/learning/${course.id}`}
          className="continue-learning-btn"
        >
          {actionLabel}
        </Link>
      </div>
    </article>
  );
}

function DashboardCourseSection({
  id,
  label,
  title,
  description,
  courses,
  actionLabel,
  emptyMessage,
  completed = false
}) {
  return (
    <section className="dashboard-courses-section" aria-labelledby={id}>
      <div className="dashboard-section-header">
        <div>
          <span className="dashboard-label">{label}</span>
          <h2 id={id}>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      {courses.length > 0 ? (
        <div className="dashboard-course-grid">
          {courses.map((course) => (
            <DashboardCourseCard
              key={String(course.id)}
              course={course}
              actionLabel={actionLabel}
              completed={completed}
            />
          ))}
        </div>
      ) : (
        <div className="dashboard-section-empty">
          <p>{emptyMessage}</p>
        </div>
      )}
    </section>
  );
}

function getModuleTitle(module) {
  if (typeof module === "string") {
    return module;
  }

  return module?.title || module?.name || "Untitled module";
}


function getSavedCompletedModules(email, courseId) {
  if (!email || !courseId) {
    return [];
  }

  try {
    const storedModules = JSON.parse(
      localStorage.getItem(`completedModules_${email}_${courseId}`) || "[]"
    );

    return Array.isArray(storedModules)
      ? storedModules
      : [];
  } catch (error) {
    console.error(
      "Error loading completed modules:",
      error
    );

    return [];
  }
}

function normalizeQuizScore(value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return null;
    }

    if (value <= 1) {
      return Math.round(value * 100);
    }

    if (value <= 100) {
      return Math.round(value);
    }

    return null;
  }

  if (typeof value === "string") {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return null;
    }

    return normalizeQuizScore(numericValue);
  }

  if (value && typeof value === "object") {
    const nestedValue =
      value.score ??
      value.quizScore ??
      value.percentage ??
      value.percent ??
      value.average ??
      value.correct;

    if (typeof nestedValue === "number") {
      return normalizeQuizScore(nestedValue);
    }

    const correctAnswers = Number(value.correct ?? value.score ?? 0);
    const totalQuestions = Number(value.total ?? value.totalQuestions ?? value.questions ?? 0);

    if (totalQuestions > 0 && Number.isFinite(correctAnswers)) {
      return Math.min(100, Math.round((correctAnswers / totalQuestions) * 100));
    }
  }

  return null;
}

function getReliableAverageQuizScore(email) {
  if (!email) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const scores = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key) {
      continue;
    }

    const normalizedKey = key.toLowerCase();

    if (
      !normalizedKey.includes("quiz") &&
      !normalizedKey.includes("score")
    ) {
      continue;
    }

    if (!normalizedKey.includes(normalizedEmail)) {
      continue;
    }

    try {
      const rawValue = JSON.parse(localStorage.getItem(key));
      const normalizedScore = normalizeQuizScore(rawValue);

      if (normalizedScore !== null) {
        scores.push(normalizedScore);
      }
    } catch (error) {
      const rawValue = localStorage.getItem(key);
      const normalizedScore = normalizeQuizScore(rawValue);

      if (normalizedScore !== null) {
        scores.push(normalizedScore);
      }
    }
  }

  if (scores.length === 0) {
    return null;
  }

  return Math.round(
    scores.reduce((total, score) => total + score, 0) / scores.length
  );
}

function Dashboard() {

  const navigate = useNavigate();

  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
    fetchCourses
  } = useCourses();


  const [dashboardData] = useState(() => {
    const loggedInStudent = getLoggedInStudent();
    const enrolled = loggedInStudent
      ? getEnrolledCourses(loggedInStudent.email)
      : [];

    return {
      student: loggedInStudent,
      enrolledCourses: Array.isArray(enrolled) ? enrolled : []
    };
  });

  const { student, enrolledCourses } = dashboardData;


  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  useEffect(() => {

    if (!isStudentLoggedIn() || !student) {
      navigate("/student-login");
    }

  }, [navigate, student]);


  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {

    logoutStudent();

    navigate("/student-login");

  }


  const courseById = new Map(
    courses.map((course) => [String(course.id), course])
  );

  const dashboardCourses = enrolledCourses.map((enrolledCourse) => {
    const apiCourse = courseById.get(String(enrolledCourse.id));
    const savedProgress = Number(enrolledCourse.progress || 0);
    const progress = Number.isFinite(savedProgress)
      ? Math.min(100, Math.max(0, savedProgress))
      : 0;

    return {
      ...enrolledCourse,
      ...(apiCourse || {}),
      id: enrolledCourse.id,
      courseName:
        apiCourse?.courseName ||
        enrolledCourse.courseName ||
        enrolledCourse.name ||
        "Unnamed Course",
      courseCode:
        apiCourse?.courseCode ||
        enrolledCourse.courseCode ||
        "COURSE",
      instructor:
        apiCourse?.instructor ||
        enrolledCourse.instructor ||
        "Instructor information unavailable",
      image: apiCourse?.image || enrolledCourse.image || "",
      progress,
      catalogMissing:
        !apiCourse && !coursesLoading && !coursesError
    };
  });

  const totalEnrolled = dashboardCourses.length;
  const completedCourseList = dashboardCourses.filter(
    (course) => course.progress === 100
  );
  const inProgressCourseList = dashboardCourses.filter(
    (course) => course.progress > 0 && course.progress < 100
  );
  const startCourseList = dashboardCourses.filter(
    (course) => course.progress === 0
  );
  const completedCourses = completedCourseList.length;
  const inProgressCourses = inProgressCourseList.length;
  const overallProgress = totalEnrolled > 0
    ? Math.round(
        dashboardCourses.reduce(
          (total, course) => total + course.progress,
          0
        ) / totalEnrolled
      )
    : 0;
  const recentEnrollments = dashboardCourses
    .slice(-3)
    .reverse();

  const analyticsCourses = dashboardCourses.map((course) => {
    const completedModules = getSavedCompletedModules(
      student?.email,
      course.id
    );

    const totalModules =
      Array.isArray(course.modules) && course.modules.length > 0
        ? course.modules.length
        : 0;

    return {
      ...course,
      completedModules,
      completedModuleCount: completedModules.length,
      totalModules
    };
  });

  const totalModulesCompleted = analyticsCourses.reduce(
    (total, course) => total + course.completedModuleCount,
    0
  );

  const averageQuizScore = getReliableAverageQuizScore(student?.email || "");

  const achievementBadges = [
    {
      name: "First Step",
      description: "Complete your first learning module.",
      icon: "👣",
      earned: totalModulesCompleted >= 1
    },
    {
      name: "Module Master",
      description: "Complete at least five learning modules.",
      icon: "📘",
      earned: totalModulesCompleted >= 5
    },
    {
      name: "Course Graduate",
      description: "Complete at least one course.",
      icon: "🎓",
      earned: completedCourses >= 1
    },
    {
      name: "Knowledge Seeker",
      description: "Enroll in at least three courses.",
      icon: "🔎",
      earned: totalEnrolled >= 3
    },
    {
      name: "Quiz Champion",
      description: "Achieve an average quiz score of at least 80%.",
      icon: "🏅",
      earned: averageQuizScore !== null && averageQuizScore >= 80
    },
    {
      name: "Learning Legend",
      description: "Complete at least three courses.",
      icon: "🌟",
      earned: completedCourses >= 3
    }
  ];

  const dashboardBookmarkedModules = student?.email
    ? getBookmarkedModules(student.email).flatMap(({ courseId, moduleId }) => {
        const matchingCourse = dashboardCourses.find(
          (course) => String(course.id) === String(courseId)
        );

        if (!matchingCourse) {
          return [];
        }

        const courseModules = Array.isArray(matchingCourse.modules)
          ? matchingCourse.modules
          : [];

        const moduleIndex = Number(moduleId);
        const moduleTitle = courseModules[moduleIndex]
          ? getModuleTitle(courseModules[moduleIndex])
          : `Module ${moduleIndex + 1}`;

        return [{
          courseId: String(matchingCourse.id),
          courseName: matchingCourse.courseName,
          courseCode: matchingCourse.courseCode,
          moduleId: String(moduleIndex),
          moduleNumber: moduleIndex + 1,
          moduleTitle
        }];
      })
    : [];


  // =====================================================
  // LOADING
  // =====================================================

  if (!student) {

    return (

      <>
        <Navbar />

        <main className="dashboard-loading">

          <div>

            <div className="loading-spinner">
              ⏳
            </div>

            <h2>
              Loading Dashboard...
            </h2>

            <p>
              Please wait while we prepare
              your learning dashboard.
            </p>

          </div>

        </main>

        <Footer />

      </>

    );

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <>

      <Navbar />


      <main className="student-dashboard">


        {/* =================================================
            WELCOME SECTION
        ================================================= */}

        <section className="dashboard-welcome">

          <div>

            <span className="dashboard-label">
              STUDENT DASHBOARD
            </span>


            <h1>
              Welcome back,{" "}
              <span>
                {student.name}
              </span>
              ! 👋
            </h1>


            <p>
              Continue your learning journey
              and keep building your skills.
            </p>

          </div>


          <div className="dashboard-student-info">

            <div className="dashboard-avatar">

              {student.name
                ?.charAt(0)
                .toUpperCase()}

            </div>


            <div>

              <strong>
                {student.name}
              </strong>

              <span>
                {student.email}
              </span>

            </div>

          </div>

        </section>


        {coursesLoading && (
          <div className="dashboard-catalog-message" role="status">
            Course details are loading. Your saved enrollment and progress remain available.
          </div>
        )}

        {coursesError && (
          <div className="dashboard-catalog-error" role="alert">
            <p>{coursesError} Saved enrollment details are still shown where available.</p>
            <button type="button" onClick={fetchCourses}>
              Retry course details
            </button>
          </div>
        )}


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="dashboard-stats">


          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              📚
            </div>

            <div>

              <span>
                ENROLLED COURSES
              </span>

              <strong>
                {totalEnrolled}
              </strong>

              <p>
                Courses you're learning
              </p>

            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              🔄
            </div>

            <div>

              <span>
                IN PROGRESS
              </span>

              <strong>
                {inProgressCourses}
              </strong>

              <p>
                Currently learning
              </p>

            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              ✅
            </div>

            <div>

              <span>
                COMPLETED
              </span>

              <strong>
                {completedCourses}
              </strong>

              <p>
                Successfully completed
              </p>

            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              📈
            </div>

            <div>

              <span>
                OVERALL PROGRESS
              </span>

              <strong>
                {overallProgress}%
              </strong>

              <p>
                Across enrolled courses
              </p>

            </div>

          </div>


        </section>


        {/* =================================================
            OVERALL PROGRESS
        ================================================= */}

        <section className="overall-progress-card">

          <div className="overall-progress-header">

            <div>

              <span className="dashboard-label">
                LEARNING PERFORMANCE
              </span>

              <h2>
                Your Overall Progress
              </h2>

            </div>


            <strong>
              {overallProgress}%
            </strong>

          </div>


          <div className="overall-progress-bar">

            <div
              className="overall-progress-fill"
              style={{
                width:
                  `${overallProgress}%`
              }}
            />

          </div>


          <div className="overall-progress-footer">

            <span>
              {completedCourses} completed
            </span>

            <span>
              {inProgressCourses} in progress
            </span>

            <span>
              {totalEnrolled} total courses
            </span>

          </div>

        </section>


        {/* =================================================
            LEARNING ANALYTICS
        ================================================= */}

        <section className="dashboard-analytics-section" aria-labelledby="learning-analytics-title">

          <div className="dashboard-section-header">

            <div>

              <span className="dashboard-label">
                LEARNING ANALYTICS
              </span>

              <h2 id="learning-analytics-title">
                Learning Analytics
              </h2>

              <p>
                Real progress from your saved enrollments, completed modules, and available quiz history.
              </p>

            </div>

          </div>

          {dashboardCourses.length === 0 ? (
            <div className="dashboard-section-empty">
              <p>Analytics will appear here after you enroll in a course.</p>
            </div>
          ) : (
            <>
              <div className="dashboard-analytics-grid">

                <div className="dashboard-analytics-card">
                  <span>OVERALL PROGRESS</span>
                  <strong>{overallProgress}%</strong>
                  <small>{completedCourses} completed · {inProgressCourses} in progress</small>
                </div>

                <div className="dashboard-analytics-card">
                  <span>COURSES COMPLETED</span>
                  <strong>{completedCourses}</strong>
                  <small>Finished courses</small>
                </div>

                <div className="dashboard-analytics-card">
                  <span>COURSES IN PROGRESS</span>
                  <strong>{inProgressCourses}</strong>
                  <small>Active enrollments</small>
                </div>

                <div className="dashboard-analytics-card">
                  <span>MODULES COMPLETED</span>
                  <strong>{totalModulesCompleted}</strong>
                  <small>Across all enrolled courses</small>
                </div>

                {averageQuizScore !== null && (
                  <div className="dashboard-analytics-card">
                    <span>AVERAGE QUIZ SCORE</span>
                    <strong>{averageQuizScore}%</strong>
                    <small>Stored quiz results</small>
                  </div>
                )}

              </div>

              <div className="dashboard-analytics-course-list">
                {analyticsCourses.map((course) => {
                  const totalModules = course.totalModules;
                  const completedCount = course.completedModuleCount;
                  const moduleMeta =
                    totalModules > 0
                      ? `${completedCount} / ${totalModules} modules completed`
                      : `${completedCount} modules completed`;

                  return (
                    <div key={String(course.id)} className="dashboard-analytics-course">
                      <div className="dashboard-analytics-course-header">
                        <div>
                          <strong>{course.courseName}</strong>
                          <small>{course.courseCode} · {course.instructor}</small>
                        </div>
                        <span>{course.progress}%</span>
                      </div>

                      <div className="course-progress-bar" aria-hidden="true">
                        <div
                          className="course-progress-fill"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>

                      <div className="dashboard-analytics-course-meta">
                        <span>{moduleMeta}</span>
                        <em>
                          {course.progress === 100
                            ? "Completed"
                            : course.progress > 0
                              ? "In progress"
                              : "Not started"}
                        </em>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </section>


        <section className="dashboard-badges-section" aria-labelledby="achievement-badges-title">

          <div className="dashboard-section-header">

            <div>

              <span className="dashboard-label">
                MILESTONES
              </span>

              <h2 id="achievement-badges-title">
                Achievement Badges
              </h2>

              <p>
                Badges reflect your saved course, module, and quiz activity.
              </p>

            </div>

          </div>

          <div className="dashboard-badge-grid">
            {achievementBadges.map((badge) => (
              <article
                key={badge.name}
                className={`dashboard-badge-card ${badge.earned ? "earned" : "locked"}`}
                aria-label={`${badge.name}: ${badge.earned ? "Earned" : "Locked"}`}
              >
                <span className="dashboard-badge-icon" aria-hidden="true">
                  {badge.icon}
                </span>

                <div className="dashboard-badge-copy">
                  <h3>{badge.name}</h3>
                  <p>{badge.description}</p>
                </div>

                <span className="dashboard-badge-status">
                  {badge.earned ? "Earned" : "Locked"}
                </span>
              </article>
            ))}
          </div>

        </section>


        <section className="dashboard-bookmarks-section" aria-labelledby="saved-bookmarks-title">

          <div className="dashboard-section-header">

            <div>

              <span className="dashboard-label">
                BOOKMARKS
              </span>

              <h2 id="saved-bookmarks-title">
                Saved Module Bookmarks
              </h2>

              <p>
                Jump back to the topics you want to review later.
              </p>

            </div>

          </div>

          {dashboardBookmarkedModules.length > 0 ? (
            <div className="dashboard-bookmark-list">
              {dashboardBookmarkedModules.map((bookmark) => (
                <Link
                  key={`${bookmark.courseId}-${bookmark.moduleId}`}
                  className="dashboard-bookmark-item"
                  to={`/learning/${bookmark.courseId}?module=${bookmark.moduleId}`}
                >
                  <span className="dashboard-bookmark-mark" aria-hidden="true">
                    ★
                  </span>

                  <span className="dashboard-bookmark-copy">
                    <strong>{bookmark.moduleTitle}</strong>
                    <small>{bookmark.courseName} · {bookmark.courseCode}</small>
                  </span>

                  <span className="dashboard-bookmark-module">
                    Module {bookmark.moduleNumber}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="dashboard-section-empty">
              <p>No bookmarked modules yet. Use the bookmark button while you learn to save key review topics.</p>
            </div>
          )}

        </section>


        {/* =================================================
            MY COURSES
        ================================================= */}

        <section className="dashboard-learning-groups">


          <div className="dashboard-section-header">

            <div>

              <span className="dashboard-label">
                MY LEARNING
              </span>

              <h2>
                My Courses
              </h2>

              <p>
                Continue where you left off.
              </p>

            </div>


            <Link
              to="/courses"
              className="view-all-courses"
            >
              Explore Courses →
            </Link>

          </div>


          {totalEnrolled === 0 ? (
            <div className="dashboard-empty">
              <span>📚</span>
              <h3>No Courses Yet</h3>
              <p>
                You have no enrolled courses yet. Explore the catalog to
                choose your first course.
              </p>
              <Link to="/courses" className="dashboard-primary-btn">
                Explore Courses
              </Link>
            </div>
          ) : (
            <>
              <DashboardCourseSection
                id="continue-learning-title"
                label="IN PROGRESS"
                title="Continue Learning"
                description="Pick up from the progress saved for each course."
                courses={inProgressCourseList}
                actionLabel="Continue Learning"
                emptyMessage="No courses are currently in progress. Start a course below to begin learning."
              />

              <DashboardCourseSection
                id="start-learning-title"
                label="READY TO BEGIN"
                title="Start Learning"
                description="Your enrolled courses with no completed modules yet."
                courses={startCourseList}
                actionLabel="Start Learning"
                emptyMessage="All enrolled courses have already been started."
              />

              <DashboardCourseSection
                id="completed-courses-title"
                label="COMPLETED"
                title="Completed Courses"
                description="Courses with all learning modules completed."
                courses={completedCourseList}
                actionLabel="Review Course"
                emptyMessage="No completed courses yet. Your completed courses will appear here."
                completed
              />

              <section className="dashboard-activity-section" aria-labelledby="recent-activity-title">
                <div className="dashboard-section-header">
                  <div>
                    <span className="dashboard-label">RECENT LEARNING ACTIVITY</span>
                    <h2 id="recent-activity-title">Latest Enrollments</h2>
                    <p>
                      Showing the last saved enrollment records. Enrollment dates are not stored.
                    </p>
                  </div>
                </div>

                {recentEnrollments.length > 0 ? (
                  <div className="dashboard-activity-list">
                    {recentEnrollments.map((course) => (
                      <Link
                        className="dashboard-activity-item"
                        key={String(course.id)}
                        to={`/learning/${course.id}`}
                      >
                        <span className="dashboard-activity-mark" aria-hidden="true">
                          {course.progress === 100 ? "✓" : "📚"}
                        </span>
                        <span className="dashboard-activity-copy">
                          <strong>{course.courseName}</strong>
                          <small>{course.courseCode} · {course.instructor}</small>
                        </span>
                        <span className="dashboard-activity-progress">
                          {course.progress}%
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="dashboard-section-empty">
                    <p>Enrollment activity will appear here after you join a course.</p>
                  </div>
                )}
              </section>
            </>
          )}

        </section>


        {/* =================================================
            PROFILE / QUICK ACTIONS
        ================================================= */}

        <section className="dashboard-bottom-grid">


          <div className="dashboard-profile-card">

            <div className="dashboard-card-heading">

              <div>

                <span className="dashboard-label">
                  PROFILE
                </span>

                <h2>
                  Student Information
                </h2>

              </div>

            </div>


            <div className="profile-detail-list">

              <div>

                <span>
                  FULL NAME
                </span>

                <strong>
                  {student.name}
                </strong>

              </div>


              <div>

                <span>
                  EMAIL
                </span>

                <strong>
                  {student.email}
                </strong>

              </div>


              <div>

                <span>
                  DEPARTMENT
                </span>

                <strong>
                  {student.department ||
                    "Not specified"}
                </strong>

              </div>


              <div>

                <span>
                  COURSE
                </span>

                <strong>
                  {student.course ||
                    "Not specified"}
                </strong>

              </div>

            </div>

          </div>


          <div className="dashboard-actions-card">

            <div>

              <span className="dashboard-label">
                QUICK ACTIONS
              </span>

              <h2>
                Keep Learning
              </h2>

            </div>


            <div className="dashboard-action-list">

              <Link to="/courses">
                📚 Browse Courses
              </Link>

              <Link to="/courses">
                🔎 Find New Course
              </Link>

              <Link to="/profile">
                👤 Manage Profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>

            </div>

          </div>


        </section>


      </main>


      <Footer />

    </>

  );

}


export default Dashboard;