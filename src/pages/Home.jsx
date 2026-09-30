import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { useCourses } from "../context/CourseContext";


function Home() {

  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
    fetchCourses
  } = useCourses();

  return (
    <>
      <Navbar />

      <main className="modern-home">

        {/* =====================================
            HERO SECTION
        ===================================== */}

        <section className="hero-section">

          <div className="hero-content">

            <div className="hero-badge">
              🎓 Smart Learning Platform
            </div>

            <h1>
              Learn.
              <span> Track.</span>
              <br />
              Grow.
            </h1>

            <p>
              Manage your courses, track your learning
              progress, complete your modules and
              build your skills — all in one place.
            </p>

            <div className="hero-buttons">

              <Link
                to="/register"
                className="hero-primary-button"
              >
                🚀 Get Started
              </Link>

              <Link
                to="/courses"
                className="hero-secondary-button"
              >
                📚 Explore Courses
              </Link>

            </div>

            <div className="hero-trust">

              <div>
                <strong>100%</strong>
                <span>Learning Focused</span>
              </div>

              <div>
                <strong>24/7</strong>
                <span>Access</span>
              </div>

              <div>
                <strong>📈</strong>
                <span>Track Progress</span>
              </div>

            </div>

          </div>


          {/* HERO VISUAL */}

          <div className="hero-visual">

            <div className="hero-main-card">

              <div className="hero-card-top">

                <div className="hero-icon">
                  🎓
                </div>

                <div>
                  <span>
                    Your Learning
                  </span>

                  <h3>
                    Dashboard
                  </h3>
                </div>

              </div>


              <div className="hero-progress-card">

                <div className="hero-progress-header">

                  <span>
                    Progress Tracking
                  </span>

                  <strong>
                    By module
                  </strong>

                </div>

                <small>Course progress reflects completed modules.</small>

              </div>


              {coursesLoading ? (
                <div className="hero-course-card">
                  <div className="mini-course-info">
                    <strong>Loading course catalog</strong>
                    <span>Course details are on the way</span>
                  </div>
                </div>
              ) : coursesError || courses.length === 0 ? (
                <div className="hero-course-card">
                  <div className="mini-course-info">
                    <strong>{coursesError ? "Catalog unavailable" : "No courses available"}</strong>
                    <span>Visit the course catalog for current availability</span>
                  </div>
                </div>
              ) : (
                courses.slice(0, 2).map((course, index) => (
                  <div className="hero-course-card" key={course.id}>
                    <div className="mini-course-icon">
                      {index === 0 ? "📘" : "💻"}
                    </div>
                    <div className="mini-course-info">
                      <strong>{course.courseName || course.name || "Untitled Course"}</strong>
                      <span>
                        {Array.isArray(course.modules)
                          ? `${course.modules.length} modules`
                          : course.category || "Course catalog"}
                      </span>
                    </div>
                    <div className="mini-arrow">→</div>
                  </div>
                ))
              )}

            </div>


            <div className="floating-card floating-card-one">

              <span>
                🏆
              </span>

              <div>
                <strong>
                  Ready to learn?
                </strong>

                <small>
                  Choose a course to begin
                </small>
              </div>

            </div>


            <div className="floating-card floating-card-two">

              <span>
                📊
              </span>

              <div>
                <strong>
                  Progress is saved
                </strong>

                <small>
                  As modules are completed
                </small>
              </div>

            </div>

          </div>

        </section>


        {/* =====================================
            PLATFORM STATS
        ===================================== */}

        <section className="platform-stats">

          <div className="platform-stat">

            <div className="stat-icon">
              📚
            </div>

            <div>
              <strong>
                {coursesLoading
                  ? "..."
                  : coursesError
                  ? "—"
                  : `${courses.length}+`}
              </strong>

              <span>
                Courses
              </span>
            </div>

          </div>


          <div className="platform-stat">

            <div className="stat-icon">
              👨‍🎓
            </div>

            <div>
              <strong>Per Student</strong>

              <span>
                Learning Accounts
              </span>
            </div>

          </div>


          <div className="platform-stat">

            <div className="stat-icon">
              📈
            </div>

            <div>
              <strong>By Module</strong>

              <span>
                Progress Tracking
              </span>
            </div>

          </div>


          <div className="platform-stat">

            <div className="stat-icon">
              🎯
            </div>

            <div>
              <strong>Self-Paced</strong>

              <span>
                Learning Access
              </span>
            </div>

          </div>

        </section>


        {/* =====================================
            FEATURES
        ===================================== */}

        <section className="features-section">

          <div className="section-heading">

            <span>
              WHY CHOOSE US
            </span>

            <h2>
              Everything you need to
              <br />
              <strong>learn better.</strong>
            </h2>

            <p>
              A simple and organized platform designed
              to help students manage their learning
              journey effectively.
            </p>

          </div>


          <div className="features-grid">

            <div className="feature-card">

              <div className="feature-icon">
                📚
              </div>

              <h3>
                Course Management
              </h3>

              <p>
                Browse available courses, enroll in
                subjects and keep all your learning
                resources organized.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                📊
              </div>

              <h3>
                Track Your Progress
              </h3>

              <p>
                Monitor your learning progress with
                clear progress indicators and course
                completion statistics.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                📝
              </div>

              <h3>
                Learn & Practice
              </h3>

              <p>
                Complete modules, assignments and
                quizzes to strengthen your knowledge.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                🏆
              </div>

              <h3>
                Achieve Your Goals
              </h3>

              <p>
                Stay motivated by completing courses
                and continuously improving your skills.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================
            FEATURED COURSES
        ===================================== */}

        <section className="featured-courses">

          <div className="section-heading">

            <span>
              START LEARNING
            </span>

            <h2>
              Explore our
              <strong> courses.</strong>
            </h2>

            <p>
              Choose a course and start building
              your skills today.
            </p>

          </div>


          {coursesLoading && (
            <div className="home-course-state" role="status">
              Loading courses from the catalog...
            </div>
          )}

          {coursesError && (
            <div className="home-course-state home-course-error" role="alert">
              <p>{coursesError}</p>
              <button type="button" onClick={fetchCourses}>
                Retry
              </button>
            </div>
          )}

          {!coursesLoading && !coursesError && courses.length === 0 && (
            <div className="home-course-state" role="status">
              No courses are currently available.
              <Link to="/courses">Open course catalog</Link>
            </div>
          )}

          {!coursesLoading && !coursesError && courses.length > 0 && (
            <div className="featured-course-grid">

            {courses.slice(0, 3).map(
              (course, index) => (

                <div
                  className="featured-course-card"
                  key={course.id}
                >

                  <div
                    className={`course-color course-color-${index + 1}`}
                  >
                    {index === 0
                      ? "🐍"
                      : index === 1
                      ? "💻"
                      : "🤖"}
                  </div>


                  <div className="featured-course-content">

                    <span className="course-label">
                      FEATURED COURSE
                    </span>

                    <h3>
                      {course.courseName || course.name}
                    </h3>

                    <p>
                      {course.overview || course.description}
                    </p>


                    <div className="course-meta">

                      <span>
                        👨‍🏫{" "}
                        {course.instructor}
                      </span>

                      <span>
                        ⏱️{" "}
                        {course.duration}
                      </span>

                    </div>


                    <Link
                      to="/courses"
                      className="course-view-button"
                    >
                      View Course →
                    </Link>

                  </div>

                </div>

              )
            )}

            </div>
          )}

        </section>


        {/* =====================================
            CTA
        ===================================== */}

        <section className="home-cta">

          <div>

            <span>
              READY TO START?
            </span>

            <h2>
              Your learning journey
              <br />
              starts here.
            </h2>

            <p>
              Create your account and start
              exploring courses today.
            </p>

          </div>


          <Link
            to="/register"
            className="cta-button"
          >
            Create Account →
          </Link>

        </section>

      </main>

      <Footer />
    </>
  );
}


export default Home;