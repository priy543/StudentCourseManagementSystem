import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  getLoggedInStudent,
  isStudentLoggedIn
} from "../modules/auth";

import {
  getEnrolledCourses,
  updateCourseProgress,
  saveAssignment,
  getAssignment,
  getCompletedModules,
  saveCompletedModules
} from "../modules/api";

import { useCourses } from "../context/CourseContext";

function getModuleTitle(module) {
  if (typeof module === "string") {
    return module;
  }

  return module?.title || module?.name || "Untitled module";
}

function getModuleVideoUrl(module) {
  const videoUrl = module && typeof module === "object"
    ? module.youtubeUrl
    : null;

  return typeof videoUrl === "string" && videoUrl.trim()
    ? videoUrl.trim()
    : null;
}

function getCertificatePart(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "UNKNOWN";
}

function getCertificateDateKey(email, courseId) {
  return `courseCompletionDate_${email}_${courseId}`;
}


function Learning() {

  const { courseId } = useParams();
  const navigate = useNavigate();

  const {
    courses,
    loading
  } = useCourses();


  const [student, setStudent] =
    useState(null);

  const [enrolledCourse, setEnrolledCourse] =
    useState(null);

  const [completedModules, setCompletedModules] =
    useState([]);

  const [certificateCompletedAt, setCertificateCompletedAt] =
    useState(null);

  const [selectedModule, setSelectedModule] =
    useState(0);

  const [assignment, setAssignment] =
    useState("");

  const [assignmentSaved, setAssignmentSaved] =
    useState(false);

  const [showQuiz, setShowQuiz] =
    useState(false);

  const [quizAnswers, setQuizAnswers] =
    useState({});

  const [quizSubmitted, setQuizSubmitted] =
    useState(false);


  // =====================================================
  // LOAD LEARNING DATA
  // =====================================================

  useEffect(() => {

    if (!isStudentLoggedIn()) {

      navigate("/login");

      return;

    }


    const loggedInStudent =
      getLoggedInStudent();


    if (!loggedInStudent) {

      navigate("/login");

      return;

    }


    setStudent(
      loggedInStudent
    );


    const enrolled =
      getEnrolledCourses(
        loggedInStudent.email
      );


    const safeCourses =
      Array.isArray(enrolled)
        ? enrolled
        : [];


    const selectedCourse =
      safeCourses.find(
        (course) =>
          String(course.id) ===
          String(courseId)
      );


    if (!selectedCourse) {

      navigate("/dashboard");

      return;

    }


    setEnrolledCourse(
      selectedCourse
    );

    setCertificateCompletedAt(
      localStorage.getItem(
        getCertificateDateKey(
          loggedInStudent.email,
          courseId
        )
      )
    );

    setCertificateCompletedAt(
      localStorage.getItem(
        getCertificateDateKey(
          loggedInStudent.email,
          courseId
        )
      )
    );


    const completed =
      getCompletedModules(
        loggedInStudent.email,
        courseId
      );

    const safeCompletedModules =
      Array.isArray(completed) && completed.length > 0
        ? completed
        : Array.isArray(selectedCourse.completedModules)
        ? selectedCourse.completedModules
        : [];

    setCompletedModules(
      safeCompletedModules
    );


    const savedAssignment =
      getAssignment(
        loggedInStudent.email,
        courseId,
        "course"
      );


    if (savedAssignment) {

      setAssignment(
        savedAssignment
      );

    }

  }, [courseId, navigate]);


  // =====================================================
  // GET API COURSE
  // =====================================================

  const apiCourse =
    useMemo(
      () =>
        courses.find(
          (course) =>
            String(course.id) ===
            String(courseId)
        ),
      [courses, courseId]
    );


  // =====================================================
  // COURSE DETAILS
  // =====================================================

  const courseName =
    apiCourse?.courseName ||
    enrolledCourse?.courseName ||
    enrolledCourse?.name ||
    "Course";


  const courseCode =
    apiCourse?.courseCode ||
    enrolledCourse?.courseCode ||
    "COURSE";


  const instructor =
    apiCourse?.instructor ||
    enrolledCourse?.instructor ||
    "Instructor";


  const overview =
    apiCourse?.overview ||
    enrolledCourse?.overview ||
    "Continue learning through the course modules.";


  const modules =
    apiCourse?.modules?.length
      ? apiCourse.modules
      : enrolledCourse?.modules?.length
      ? enrolledCourse.modules
      : [
          "Course Introduction",
          "Core Concepts",
          "Practical Learning",
          "Assessment",
          "Mini Project"
        ];

  const currentModule =
    modules[selectedModule] ||
    modules[0];

  const currentModuleTitle = getModuleTitle(currentModule);
  const currentModuleDescription =
    currentModule && typeof currentModule === "object"
      ? currentModule.description
      : null;
  const currentModuleVideoUrl = getModuleVideoUrl(currentModule);


  // =====================================================
  // CURRENT MODULE
  // =====================================================

  // =====================================================
  // PROGRESS
  // =====================================================

  const progress =
    Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (completedModules.length /
            modules.length) *
            100
        )
      )
    );

  const certificateId = [
    "CERT",
    getCertificatePart(courseCode),
    getCertificatePart(courseId),
    getCertificatePart(student?.id || student?.email)
  ].join("-");

  const parsedCompletionDate = certificateCompletedAt
    ? new Date(certificateCompletedAt)
    : null;
  const formattedCompletionDate = parsedCompletionDate &&
    !Number.isNaN(parsedCompletionDate.getTime())
    ? parsedCompletionDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "Not recorded in learning history";


  // =====================================================
  // MARK MODULE COMPLETE
  // =====================================================

  function handleCompleteModule() {

    if (
      completedModules.includes(
        selectedModule
      )
    ) {

      return;

    }


    const updatedCompletedModules =
      [
        ...completedModules,
        selectedModule
      ];


    setCompletedModules(
      updatedCompletedModules
    );

    if (updatedCompletedModules.length === modules.length) {
      const completionDateKey = getCertificateDateKey(
        student.email,
        courseId
      );
      const completedAt =
        localStorage.getItem(completionDateKey) ||
        new Date().toISOString();

      localStorage.setItem(completionDateKey, completedAt);
      setCertificateCompletedAt(completedAt);
    }


    saveCompletedModules(
      student.email,
      courseId,
      updatedCompletedModules
    );


    updateCourseProgress(
      student.email,
      courseId,
      Math.round(
        (updatedCompletedModules.length /
          modules.length) *
          100
      ),
      updatedCompletedModules
    );


    if (
      selectedModule <
      modules.length - 1
    ) {

      setSelectedModule(
        selectedModule + 1
      );

    }

  }


  // =====================================================
  // SELECT MODULE
  // =====================================================

  function handleSelectModule(
    index
  ) {

    setSelectedModule(
      index
    );

    setShowQuiz(false);

    setQuizSubmitted(false);

  }


  // =====================================================
  // ASSIGNMENT
  // =====================================================

  function handleSaveAssignment() {

    if (!student) {
      return;
    }


    saveAssignment(
      student.email,
      courseId,
      "course",
      assignment
    );


    setAssignmentSaved(
      true
    );


    setTimeout(() => {

      setAssignmentSaved(
        false
      );

    }, 2500);

  }


  // =====================================================
  // QUIZ DATA
  // =====================================================

  const quizQuestions = [

    {
      question:
        "What is the main purpose of this course?",
      options: [
        "Learning the course concepts",
        "Only watching videos",
        "Only completing assignments",
        "Only taking quizzes"
      ],
      answer: 0
    },

    {
      question:
        "What should a student do after learning a module?",
      options: [
        "Skip the next module",
        "Practice and review the concept",
        "Close the course",
        "Delete the progress"
      ],
      answer: 1
    },

    {
      question:
        "How is learning progress tracked?",
      options: [
        "By completed modules",
        "By login count",
        "By email length",
        "By browser type"
      ],
      answer: 0
    }

  ];


  // =====================================================
  // QUIZ ANSWER
  // =====================================================

  function handleQuizAnswer(
    questionIndex,
    answerIndex
  ) {

    setQuizAnswers(
      (previous) => ({
        ...previous,
        [questionIndex]:
          answerIndex
      })
    );

  }


  // =====================================================
  // SUBMIT QUIZ
  // =====================================================

  function handleQuizSubmit() {

    setQuizSubmitted(
      true
    );

  }


  const quizScore =
    quizQuestions.reduce(
      (
        score,
        question,
        index
      ) =>
        score +
        (
          quizAnswers[index] ===
          question.answer
            ? 1
            : 0
        ),
      0
    );


  // =====================================================
  // LOADING
  // =====================================================

  if (
    loading ||
    !student ||
    !enrolledCourse
  ) {

    return (

      <>

        <Navbar />

        <main className="learning-loading">

          <div>

            <div className="learning-loading-icon">
              📚
            </div>

            <h2>
              Loading Learning Space...
            </h2>

            <p>
              Please wait while your course
              is being prepared.
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


      <main className="learning-page">


        {/* =================================================
            COURSE HEADER
        ================================================= */}

        <section className="learning-header">

          <div>

            <Link
              to="/dashboard"
              className="back-dashboard-link"
            >
              ← Back to Dashboard
            </Link>


            <span className="learning-course-code">
              {courseCode}
            </span>


            <h1>
              {courseName}
            </h1>


            <p>
              {overview}
            </p>


            <div className="learning-course-meta">

              <span>
                👨‍🏫 {instructor}
              </span>

              <span>
                📚 {modules.length} Modules
              </span>

              {apiCourse?.duration && (

                <span>
                  ⏱️ {apiCourse.duration}
                </span>

              )}

            </div>

          </div>


          <div className="learning-progress-card">

            <span>
              COURSE PROGRESS
            </span>

            <strong>
              {progress}%
            </strong>

            <div className="learning-progress-bar">

              <div
                className="learning-progress-fill"
                style={{
                  width:
                    `${progress}%`
                }}
              />

            </div>

            <small>
              {completedModules.length} of{" "}
              {modules.length} modules completed
            </small>

          </div>

        </section>


        {/* =================================================
            LEARNING LAYOUT
        ================================================= */}

        <section className="learning-layout">


          {/* =================================================
              MODULE SIDEBAR
          ================================================= */}

          <aside className="learning-sidebar">

            <div className="learning-sidebar-heading">

              <span>
                COURSE CONTENT
              </span>

              <strong>
                {completedModules.length}/
                {modules.length}
              </strong>

            </div>


            <div className="learning-module-list">

              {modules.map(
                (
                  module,
                  index
                ) => {

                  const completed =
                    completedModules.includes(
                      index
                    );


                  const active =
                    selectedModule ===
                    index;


                  return (

                    <button
                      type="button"
                      key={index}
                      className={
                        `learning-module-item ${
                          active
                            ? "active"
                            : ""
                        } ${
                          completed
                            ? "completed"
                            : ""
                        }`
                      }
                      onClick={() =>
                        handleSelectModule(
                          index
                        )
                      }
                    >

                      <span className="module-number">

                        {completed
                          ? "✓"
                          : index + 1}

                      </span>


                      <span className="module-title">

                        {module}

                      </span>


                      {completed && (

                        <span className="module-check">
                          ✓
                        </span>

                      )}

                    </button>

                  );

                }
              )}

            </div>


            {/* ASSIGNMENT LINK */}

            <button
              type="button"
              className="learning-sidebar-extra"
              onClick={() =>
                setShowQuiz(false)
              }
            >
              📝 Assignment
            </button>


            <button
              type="button"
              className="learning-sidebar-extra"
              onClick={() =>
                setShowQuiz(true)
              }
            >
              🧠 Course Quiz
            </button>

          </aside>


          {/* =================================================
              MAIN LEARNING CONTENT
          ================================================= */}

          <div className="learning-main">


            {!showQuiz ? (

              <>


                {/* =================================================
                    MODULE CONTENT
                ================================================= */}

                <article className="module-content-card">

                  <div className="module-content-top">

                    <div>

                      <span className="learning-section-label">
                        MODULE{" "}
                        {selectedModule + 1}
                      </span>

                      <h2>
                        {currentModule}
                      </h2>

                    </div>


                    {completedModules.includes(
                      selectedModule
                    ) && (

                      <span className="module-completed-badge">
                        ✓ Completed
                      </span>

                    )}

                  </div>


                  <div className="module-learning-content">

                    <div className="module-visual">

                      <span>
                        📖
                      </span>

                    </div>


                    <h3>
                      Learn: {currentModule}
                    </h3>


                    <p>
                      This module helps you
                      understand the key concepts
                      of <strong>{currentModule}</strong>.
                      Read the material, practice
                      the concept and complete the
                      module when you are ready.
                    </p>


                    <div className="module-info-grid">

                      <div>

                        <span>
                          MODULE
                        </span>

                        <strong>
                          {selectedModule + 1}
                        </strong>

                      </div>


                      <div>

                        <span>
                          TOTAL MODULES
                        </span>

                        <strong>
                          {modules.length}
                        </strong>

                      </div>


                      <div>

                        <span>
                          PROGRESS
                        </span>

                        <strong>
                          {progress}%
                        </strong>

                      </div>

                    </div>


                    <div className="module-study-note">

                      <strong>
                        💡 Learning Tip
                      </strong>

                      <p>
                        Take notes while learning
                        and try to connect this topic
                        with practical examples.
                      </p>

                    </div>

                  </div>


                  {/* MODULE ACTIONS */}

                  <div className="module-actions">

                    <button
                      type="button"
                      className="module-prev-btn"
                      disabled={
                        selectedModule === 0
                      }
                      onClick={() =>
                        setSelectedModule(
                          selectedModule - 1
                        )
                      }
                    >
                      ← Previous
                    </button>


                    {!completedModules.includes(
                      selectedModule
                    ) ? (

                      <button
                        type="button"
                        className="complete-module-btn"
                        onClick={
                          handleCompleteModule
                        }
                      >
                        ✓ Mark as Complete
                      </button>

                    ) : (

                      <button
                        type="button"
                        className="complete-module-btn completed"
                        disabled
                      >
                        ✓ Module Completed
                      </button>

                    )}


                    <button
                      type="button"
                      className="module-next-btn"
                      disabled={
                        selectedModule ===
                        modules.length - 1
                      }
                      onClick={() =>
                        setSelectedModule(
                          selectedModule + 1
                        )
                      }
                    >
                      Next →
                    </button>

                  </div>

                </article>


                {/* =================================================
                    ASSIGNMENT
                ================================================= */}

                <section className="learning-assignment-card">

                  <div className="learning-card-heading">

                    <div>

                      <span className="learning-section-label">
                        PRACTICAL TASK
                      </span>

                      <h2>
                        📝 Course Assignment
                      </h2>

                    </div>

                  </div>


                  <p>
                    Write your answer or notes
                    for this course assignment.
                  </p>


                  <textarea
                    value={assignment}
                    onChange={(event) =>
                      setAssignment(
                        event.target.value
                      )
                    }
                    placeholder="Write your assignment answer here..."
                  />


                  <div className="assignment-actions">

                    <button
                      type="button"
                      onClick={
                        handleSaveAssignment
                      }
                    >
                      💾 Save Assignment
                    </button>


                    {assignmentSaved && (

                      <span>
                        ✓ Assignment saved
                      </span>

                    )}

                  </div>

                </section>

              </>

            ) : (


              /* =================================================
                 QUIZ
              ================================================= */

              <section className="learning-quiz-card">

                <div className="learning-card-heading">

                  <div>

                    <span className="learning-section-label">
                      KNOWLEDGE CHECK
                    </span>

                    <h2>
                      🧠 Course Quiz
                    </h2>

                  </div>

                </div>


                <p className="quiz-intro">
                  Test your understanding of
                  the course concepts.
                </p>


                <div className="quiz-question-list">

                  {quizQuestions.map(
                    (
                      question,
                      questionIndex
                    ) => (

                      <div
                        className="quiz-question"
                        key={questionIndex}
                      >

                        <h3>
                          {questionIndex + 1}.{" "}
                          {question.question}
                        </h3>


                        <div className="quiz-options">

                          {question.options.map(
                            (
                              option,
                              optionIndex
                            ) => (

                              <label
                                key={
                                  optionIndex
                                }
                                className={
                                  `quiz-option ${
                                    quizAnswers[
                                      questionIndex
                                    ] ===
                                    optionIndex
                                      ? "selected"
                                      : ""
                                  }`
                                }
                              >

                                <input
                                  type="radio"
                                  name={
                                    `question-${questionIndex}`
                                  }
                                  checked={
                                    quizAnswers[
                                      questionIndex
                                    ] ===
                                    optionIndex
                                  }
                                  onChange={() =>
                                    handleQuizAnswer(
                                      questionIndex,
                                      optionIndex
                                    )
                                  }
                                />

                                <span>
                                  {option}
                                </span>

                              </label>

                            )
                          )}

                        </div>

                      </div>

                    )
                  )}

                </div>


                <button
                  type="button"
                  className="submit-quiz-btn"
                  onClick={
                    handleQuizSubmit
                  }
                >
                  Submit Quiz
                </button>


                {quizSubmitted && (

                  <div className="quiz-result">

                    <span>
                      🎯
                    </span>

                    <div>

                      <strong>
                        Your Score:{" "}
                        {quizScore}/
                        {quizQuestions.length}
                      </strong>

                      <p>
                        {quizScore ===
                        quizQuestions.length
                          ? "Excellent! You answered every question correctly."
                          : "Review the course modules and try the quiz again."}
                      </p>

                    </div>

                  </div>

                )}

              </section>

            )}

          </div>

        </section>


        {/* =================================================
            COMPLETION MESSAGE
        ================================================= */}

        {progress === 100 && (

          <section className="course-completion-card">

            <div className="completion-icon">
              🎉
            </div>


            <div>

              <span className="learning-section-label">
                COURSE COMPLETED
              </span>

              <h2>
                Congratulations, {student.name}!
              </h2>

              <p>
                You have completed all modules
                in {courseName}.
              </p>

            </div>


            <Link
              to="/dashboard"
              className="completion-btn"
            >
              Back to Dashboard
            </Link>

          </section>

        )}

      </main>


      <Footer />

    </>

  );

}


export default Learning;