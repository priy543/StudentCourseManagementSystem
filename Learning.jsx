import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate, useParams } from "react-router-dom";

function Learning() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const enrolledCourses =
    JSON.parse(localStorage.getItem("enrolledCourses")) || [];

  const course = enrolledCourses.find(
    (item) => item.id === Number(courseId)
  );

  const modules = [
    {
      id: 1,
      title: "Module 1: Introduction",
      description:
        "Learn the basic concepts and fundamentals of the course.",
      material:
        "Introduction to the course and basic terminology.",
      assignment:
        "Write a short summary about the basic concepts.",
      quiz: [
        {
          question: "What is the main purpose of this module?",
          options: [
            "To understand the basic concepts",
            "To delete the course",
            "To skip learning",
            "To logout"
          ],
          answer: 0
        },
        {
          question:
            "What should a student do before starting practical work?",
          options: [
            "Skip the topic",
            "Understand the fundamentals",
            "Delete the account",
            "Leave the course"
          ],
          answer: 1
        },
        {
          question:
            "What is important for effective learning?",
          options: [
            "Regular practice",
            "Skipping modules",
            "Ignoring assignments",
            "Not attending lessons"
          ],
          answer: 0
        }
      ]
    },

    {
      id: 2,
      title: "Module 2: Core Concepts",
      description:
        "Understand the important concepts of the course.",
      material:
        "Study the core concepts and important definitions.",
      assignment:
        "Explain any three important concepts.",
      quiz: [
        {
          question: "What are core concepts?",
          options: [
            "Important ideas of a subject",
            "Login details",
            "Website colors",
            "Notifications"
          ],
          answer: 0
        },
        {
          question: "Why are concepts important?",
          options: [
            "They build a strong foundation",
            "They remove the course",
            "They stop learning",
            "They delete assignments"
          ],
          answer: 0
        },
        {
          question:
            "Which approach helps understand concepts?",
          options: [
            "Practice and examples",
            "Skipping lessons",
            "Ignoring examples",
            "Avoiding questions"
          ],
          answer: 0
        }
      ]
    },

    {
      id: 3,
      title: "Module 3: Practical Learning",
      description:
        "Practice the concepts with examples and exercises.",
      material:
        "Complete the practical examples and exercises.",
      assignment:
        "Create a small practical project using the concepts.",
      quiz: [
        {
          question: "What is practical learning?",
          options: [
            "Applying knowledge through practice",
            "Reading only",
            "Skipping exercises",
            "Deleting projects"
          ],
          answer: 0
        },
        {
          question:
            "What helps improve practical skills?",
          options: [
            "Practice",
            "Avoiding projects",
            "Skipping exercises",
            "Ignoring mistakes"
          ],
          answer: 0
        },
        {
          question:
            "What can students create after learning?",
          options: [
            "A practical project",
            "A deleted account",
            "A blank page",
            "Nothing"
          ],
          answer: 0
        }
      ]
    },

    {
      id: 4,
      title: "Module 4: Final Assessment",
      description:
        "Complete the final assessment and review.",
      material:
        "Review all the modules before taking the final quiz.",
      assignment:
        "Complete the final assessment.",
      quiz: [
        {
          question:
            "What should students do before the final assessment?",
          options: [
            "Review the modules",
            "Skip all modules",
            "Delete their progress",
            "Logout"
          ],
          answer: 0
        },
        {
          question: "What does an assessment measure?",
          options: [
            "Learning and understanding",
            "Internet speed",
            "Screen size",
            "Account password"
          ],
          answer: 0
        },
        {
          question:
            "What indicates successful course completion?",
          options: [
            "Completing all required modules",
            "Opening the course once",
            "Logging out",
            "Deleting the course"
          ],
          answer: 0
        }
      ]
    }
  ];

  const [completedModules, setCompletedModules] =
    useState(course?.completedModules || []);

  const [selectedModule, setSelectedModule] =
    useState(null);

  const [answers, setAnswers] = useState({});

  const [quizScore, setQuizScore] = useState(null);

  const [quizSubmitted, setQuizSubmitted] =
    useState(false);

  const [assignmentText, setAssignmentText] =
    useState("");

  const [assignmentSubmitted, setAssignmentSubmitted] =
    useState(false);


  if (!course) {
    return (
      <>
        <Navbar />

        <main className="learning-page">

          <h1>Course Not Found</h1>

          <p>
            Please enroll in this course before accessing it.
          </p>

          <button
            onClick={() => navigate("/courses")}
          >
            Browse Courses
          </button>

        </main>

        <Footer />
      </>
    );
  }


  function startModule(module) {

    setSelectedModule(module);

    setAnswers({});

    setQuizScore(null);

    setQuizSubmitted(false);

    // Check previous assignment submission
    const submissions =
      JSON.parse(
        localStorage.getItem("assignmentSubmissions")
      ) || {};

    const submission =
      submissions[
        course.id + "-" + module.id
      ];

    if (submission) {
      setAssignmentText(submission.text);
      setAssignmentSubmitted(true);
    } else {
      setAssignmentText("");
      setAssignmentSubmitted(false);
    }
  }


  function handleAnswer(
    questionIndex,
    answerIndex
  ) {

    setAnswers({
      ...answers,
      [questionIndex]: answerIndex
    });
  }


  function submitQuiz() {

    if (!selectedModule) {
      return;
    }

    const questions =
      selectedModule.quiz;

    const answeredQuestions =
      Object.keys(answers).length;

    if (
      answeredQuestions !==
      questions.length
    ) {

      alert(
        "Please answer all questions before submitting."
      );

      return;
    }

    let score = 0;

    questions.forEach(
      (question, index) => {

        if (
          answers[index] ===
          question.answer
        ) {
          score++;
        }

      }
    );

    setQuizScore(score);

    setQuizSubmitted(true);

    if (
      score === questions.length
    ) {

      alert(
        "🎉 Excellent! You passed the quiz!"
      );

    } else {

      alert(
        "You did not get all answers correct. Review the module and try again."
      );

    }
  }


  function submitAssignment() {

    if (!selectedModule) {
      return;
    }

    if (!assignmentText.trim()) {

      alert(
        "Please enter your assignment answer before submitting."
      );

      return;
    }

    const submissions =
      JSON.parse(
        localStorage.getItem("assignmentSubmissions")
      ) || {};

    const submissionKey =
      course.id + "-" + selectedModule.id;

    submissions[submissionKey] = {
      courseId: course.id,
      moduleId: selectedModule.id,
      courseName: course.name,
      moduleName: selectedModule.title,
      text: assignmentText,
      submittedAt:
        new Date().toLocaleString()
    };

    localStorage.setItem(
      "assignmentSubmissions",
      JSON.stringify(submissions)
    );

    setAssignmentSubmitted(true);

    alert("📝 Assignment submitted successfully!");
  }


  function markComplete(moduleId) {

    if (completedModules.includes(moduleId)) {
      return;
    }

    const updatedCompletedModules = [
      ...completedModules,
      moduleId
    ];

    setCompletedModules(
      updatedCompletedModules
    );

    const progress = Math.round(
      (
        updatedCompletedModules.length /
        modules.length
      ) * 100
    );

    const updatedCourses =
      enrolledCourses.map(
        (item) =>
          item.id === course.id
            ? {
                ...item,
                progress: progress,
                completedModules:
                  updatedCompletedModules
              }
            : item
      );

    localStorage.setItem(
      "enrolledCourses",
      JSON.stringify(updatedCourses)
    );

    if (progress === 100) {

      alert(
        "🎉 Congratulations! You completed the course!"
      );

    }
  }


  function completeModule() {

    if (!selectedModule) {
      return;
    }

    if (
      quizScore !==
      selectedModule.quiz.length
    ) {

      alert(
        "Please pass the quiz before completing this module."
      );

      return;
    }

    if (!assignmentSubmitted) {

      alert(
        "Please submit the assignment before completing this module."
      );

      return;
    }

    markComplete(
      selectedModule.id
    );
  }


  return (
    <>
      <Navbar />

      <main className="learning-page">

        {/* Course Header */}

        <h1>{course.name}</h1>

        <p>
          <strong>Instructor:</strong>{" "}
          {course.instructor}
        </p>

        <p>
          <strong>Duration:</strong>{" "}
          {course.duration}
        </p>


        {/* Progress */}

        <div className="learning-progress">

          <h2>
            Course Progress:{" "}
            {course.progress || 0}%
          </h2>

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


        {/* Course Modules */}

        <h2>📚 Course Modules</h2>

        <div className="modules-container">

          {modules.map((module) => {

            const isCompleted =
              completedModules.includes(
                module.id
              );

            return (

              <div
                className="module-card"
                key={module.id}
              >

                <h3>
                  {module.title}
                </h3>

                <p>
                  {module.description}
                </p>

                <button
                  onClick={() =>
                    startModule(module)
                  }
                >
                  📖 Open Module
                </button>

                <br />
                <br />

                {isCompleted ? (

                  <button
                    className="completed-button"
                    disabled
                  >
                    ✓ Completed
                  </button>

                ) : (

                  <button
                    onClick={() =>
                      startModule(module)
                    }
                  >
                    Start Learning
                  </button>

                )}

              </div>

            );

          })}

        </div>


        {/* Selected Module */}

        {selectedModule && (

          <div className="module-content">

            <h2>
              📖 {selectedModule.title}
            </h2>


            {/* Learning Material */}

            <div className="material-box">

              <h3>
                📄 Learning Material
              </h3>

              <p>
                {selectedModule.material}
              </p>

              <p>
                Read the material carefully
                before attempting the quiz.
              </p>

              <button>
                View Material
              </button>

            </div>


            {/* Assignment */}

            <div className="assignment-box">

              <h3>
                📝 Assignment
              </h3>

              <p>
                {selectedModule.assignment}
              </p>


              {assignmentSubmitted ? (

                <div>

                  <p>
                    ✅ Assignment Submitted
                  </p>

                  <p>
                    Your assignment has been
                    successfully submitted.
                  </p>

                  <button
                    disabled
                  >
                    Submitted
                  </button>

                </div>

              ) : (

                <div>

                  <textarea
                    className="assignment-input"
                    placeholder="Write your assignment answer here..."
                    value={assignmentText}
                    onChange={(event) =>
                      setAssignmentText(
                        event.target.value
                      )
                    }
                    rows="6"
                  ></textarea>

                  <br />

                  <button
                    onClick={
                      submitAssignment
                    }
                  >
                    Submit Assignment
                  </button>

                </div>

              )}

            </div>


            {/* Quiz */}

            <div className="quiz-box">

              <h3>
                🧠 Module Quiz
              </h3>


              {selectedModule.quiz.map(
                (question, index) => (

                  <div
                    className="quiz-question"
                    key={index}
                  >

                    <p>
                      <strong>
                        {index + 1}.{" "}
                        {question.question}
                      </strong>
                    </p>


                    {question.options.map(
                      (
                        option,
                        optionIndex
                      ) => (

                        <label
                          key={optionIndex}
                        >

                          <input
                            type="radio"
                            name={
                              "question-" +
                              index
                            }
                            checked={
                              answers[index] ===
                              optionIndex
                            }
                            onChange={() =>
                              handleAnswer(
                                index,
                                optionIndex
                              )
                            }
                          />

                          {" "}

                          {option}

                        </label>

                      )
                    )}

                  </div>

                )
              )}


              <button
                onClick={submitQuiz}
              >
                Submit Quiz
              </button>


              {quizSubmitted &&
                quizScore !== null && (

                  <div className="quiz-result">

                    <h3>
                      🎯 Your Score:{" "}
                      {quizScore}/
                      {
                        selectedModule.quiz.length
                      }
                    </h3>


                    {quizScore ===
                    selectedModule.quiz.length ? (

                      <p>
                        ✅ Passed! You can now
                        complete this module.
                      </p>

                    ) : (

                      <p>
                        ❌ Not passed. Please
                        review the material and
                        try the quiz again.
                      </p>

                    )}

                  </div>

                )}


              {quizScore ===
                selectedModule.quiz.length && (
                
                <button
                  className="complete-module-button"
                  onClick={completeModule}
                >
                  ✓ Complete Module
                </button>

              )}

            </div>

          </div>

        )}


        {/* Back Button */}

        <button
          className="dashboard-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          Back to Dashboard
        </button>

      </main>

      <Footer />
    </>
  );
}

export default Learning;