import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

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
  saveCompletedModules,
  saveModuleNote,
  getModuleNote,
  saveModuleBookmark,
  getModuleBookmark
} from "../modules/api";

import { useCourses } from "../context/CourseContext";

function getModuleTitle(module) {
  if (typeof module === "string") {
    return module;
  }

  return module?.title || module?.name || "Untitled module";
}

function getModuleVideoId(module) {
  if (!module || typeof module !== "object") {
    return null;
  }

  const directVideoId = module.videoId;
  if (typeof directVideoId === "string" && /^[\w-]{11}$/.test(directVideoId)) {
    return directVideoId;
  }

  if (typeof module.youtubeUrl !== "string") {
    return null;
  }

  try {
    const videoUrl = new URL(module.youtubeUrl);
    const embeddedVideoId = videoUrl.pathname.match(/\/embed\/([\w-]{11})/);
    const linkedVideoId = videoUrl.hostname === "youtu.be"
      ? videoUrl.pathname.slice(1)
      : videoUrl.searchParams.get("v");
    const videoId = embeddedVideoId?.[1] || linkedVideoId;

    return typeof videoId === "string" && /^[\w-]{11}$/.test(videoId)
      ? videoId
      : null;
  } catch {
    return null;
  }
}

function getModuleVideoUrl(module) {
  const videoId = getModuleVideoId(module);
  return videoId
    ? `https://www.youtube.com/embed/${videoId}`
    : null;
}

const MODULE_QUIZZES = {
  CS101: {
    "Python Basics": [
      {
        question: 'What type does Python assign to `language = "Python"`?',
        options: ["str", "int", "bool", "list"],
        answer: 0,
        feedback: "Quoted text is a string, so Python gives this variable the str type."
      },
      {
        question: 'What is the result of `int("42")`?',
        options: ["The string \"42\"", "The integer 42", "The float 42.0", "An error in every case"],
        answer: 1,
        feedback: "int() converts a valid numeric string to an integer."
      },
      {
        question: "What happens when a value is assigned to an existing Python variable?",
        options: ["Its type can never change", "Python creates a constant", "The name is rebound to the new value", "The assignment is ignored"],
        answer: 2,
        feedback: "Python names are dynamically bound; a later assignment can bind the name to another value and type."
      }
    ],
    "Control Statements": [
      {
        question: "When does the body of an `if` statement run?",
        options: ["When its condition evaluates to true", "After every loop iteration", "Only when the program ends", "Whenever a function returns"],
        answer: 0,
        feedback: "An if block executes only when its condition is truthy."
      },
      {
        question: "What is `elif` used for in a conditional chain?",
        options: ["Repeating a block forever", "Testing another condition if earlier ones were false", "Defining a function", "Ending a program"],
        answer: 1,
        feedback: "elif adds another mutually exclusive condition after an if or earlier elif condition."
      },
      {
        question: "What does `for item in items` do?",
        options: ["Runs only when items is empty", "Creates a new class", "Visits each item in the iterable", "Repeats until a condition becomes false"],
        answer: 2,
        feedback: "A for loop iterates over the values yielded by an iterable."
      }
    ],
    "Functions": [
      {
        question: "Which keyword begins a named function definition in Python?",
        options: ["func", "def", "function", "lambda"],
        answer: 1,
        feedback: "A standard named function is declared with `def`, followed by its name and parameters."
      },
      {
        question: "What does `return result` do inside a function?",
        options: ["Passes a value back to the caller", "Prints the value to the screen", "Repeats the function", "Declares a global variable"],
        answer: 0,
        feedback: "return ends the current function call and supplies its value to the caller."
      },
      {
        question: "When is a function's default parameter value used?",
        options: ["Whenever the function returns", "Only for keyword arguments", "When that argument is omitted", "Only inside a loop"],
        answer: 2,
        feedback: "Python uses a parameter's default when the caller does not provide that argument."
      }
    ],
    OOP: [
      {
        question: "In Python OOP, what does a class primarily define?",
        options: ["A template for creating objects", "A loop over dictionary keys", "A module installation", "A text file format"],
        answer: 0,
        feedback: "A class defines the attributes and behavior that its instances can have."
      },
      {
        question: "What does `self` refer to in an instance method?",
        options: ["The parent class", "The current instance", "The Python interpreter", "The method's return value"],
        answer: 1,
        feedback: "Python passes the instance as the first argument to an instance method, conventionally named self."
      },
      {
        question: "What is a common purpose of class inheritance?",
        options: ["Convert every object to a string", "Prevent methods from being called", "Reuse and specialize behavior from another class", "Replace all instance attributes"],
        answer: 2,
        feedback: "A subclass can reuse and extend behavior defined by its base class."
      }
    ],
    "Mini Project": [
      {
        question: "Why split a small Python project into functions?",
        options: ["To give each task a clear, reusable unit", "To avoid using variables", "To make every line run twice", "To prevent testing"],
        answer: 0,
        feedback: "Small functions make project steps easier to understand, test, and reuse."
      },
      {
        question: "What is a useful first check after adding user input to a project?",
        options: ["Assume every input is valid", "Try representative valid and invalid inputs", "Remove all error handling", "Test only after publishing"],
        answer: 1,
        feedback: "Testing normal and edge-case input early helps reveal parsing and validation issues."
      },
      {
        question: "A project repeats the same calculation in several places. What is a maintainable improvement?",
        options: ["Copy it into more places", "Hide it in a comment", "Move it into a function and call it", "Replace it with a print statement"],
        answer: 2,
        feedback: "Extracting repeated behavior into a function gives one implementation to test and maintain."
      }
    ]
  },
  WD101: {
    HTML: [
      {
        question: "Which element represents the primary content of an HTML document?",
        options: ["<main>", "<span>", "<br>", "<meta>"],
        answer: 0,
        feedback: "The main element identifies the document's dominant, page-specific content."
      },
      {
        question: "Where should a link's destination URL be placed?",
        options: ["The src attribute of <a>", "The href attribute of <a>", "The alt attribute of <a>", "The class attribute of <a>"],
        answer: 1,
        feedback: "An anchor element uses href to specify its destination."
      },
      {
        question: "Why is meaningful alt text used on an informative image?",
        options: ["It changes the image's file type", "It sets the image width", "It provides a text alternative for assistive technology", "It loads a stylesheet"],
        answer: 2,
        feedback: "The alt attribute communicates an informative image's meaning when it cannot be seen."
      }
    ],
    CSS: [
      {
        question: "In the rule `p { color: navy; }`, what does `p` select?",
        options: ["All paragraph elements", "Elements with id p", "Every element with a navy class", "Only the first paragraph"],
        answer: 0,
        feedback: "A type selector such as p matches elements with that HTML tag."
      },
      {
        question: "In the CSS box model, where is padding located?",
        options: ["Outside the margin", "Between content and border", "Outside the border", "Inside the content text"],
        answer: 1,
        feedback: "Padding adds space between an element's content and its border."
      },
      {
        question: "What is a media query commonly used for?",
        options: ["Adding an HTML attribute", "Submitting a form", "Applying styles conditionally for a viewport or device feature", "Loading JavaScript modules"],
        answer: 2,
        feedback: "Media queries let CSS adapt layout and styling to viewport conditions such as width."
      }
    ],
    JavaScript: [
      {
        question: "Which declaration is designed for a binding that will be reassigned?",
        options: ["const", "let", "static", "define"],
        answer: 1,
        feedback: "let declares a block-scoped binding that can be reassigned."
      },
      {
        question: "What does `===` check in JavaScript?",
        options: ["Strict equality without type coercion", "Whether two values are both strings", "Whether a value is truthy", "Whether an object has a property"],
        answer: 0,
        feedback: "Strict equality compares value and type without coercing the operands."
      },
      {
        question: "How can code respond to a button click in the browser?",
        options: ["Call JSON.parse on the button", "Change the script's filename", "Register a click event listener", "Use a CSS selector as a function"],
        answer: 2,
        feedback: "A click event listener runs a handler when the user activates the button."
      }
    ],
    DOM: [
      {
        question: 'What does `document.querySelector(".notice")` return?',
        options: ["The first matching element, or null", "Every matching element in an array", "The page's stylesheet", "The browser's address"],
        answer: 0,
        feedback: "querySelector returns the first element matching a CSS selector, or null if none matches."
      },
      {
        question: "Which property inserts a value as plain text rather than parsing it as HTML?",
        options: ["outerHTML", "textContent", "innerHTML", "styleSheet"],
        answer: 1,
        feedback: "textContent treats the assigned value as text, rather than parsing markup."
      },
      {
        question: "What is the purpose of `addEventListener` on a DOM element?",
        options: ["Create a new HTML document", "Fetch a stylesheet", "Register a handler for an event", "Convert a node into JSON"],
        answer: 2,
        feedback: "addEventListener registers a callback that runs when the chosen event occurs."
      }
    ],
    "REST APIs": [
      {
        question: "Which HTTP method is conventionally used to retrieve a resource?",
        options: ["GET", "DELETE", "PATCH", "TRACE"],
        answer: 0,
        feedback: "GET requests representation data for a resource and should not modify it."
      },
      {
        question: "What does a 201 HTTP status usually indicate?",
        options: ["The request was unauthorized", "A resource was created", "The server had an error", "The resource was not found"],
        answer: 1,
        feedback: "201 Created indicates the request succeeded and created a resource."
      },
      {
        question: "Why does a client commonly parse a JSON API response?",
        options: ["To turn the response into CSS", "To change the HTTP method", "To use the structured response data in application code", "To bypass the server"],
        answer: 2,
        feedback: "Parsing JSON converts the response representation into data the application can inspect and use."
      }
    ]
  },
  AI101: {
    "Introduction to AI": [
      {
        question: "Which best describes the goal of artificial intelligence?",
        options: ["Build systems that perform tasks associated with intelligent behavior", "Store every possible answer in a spreadsheet", "Replace all computer networks", "Make programs independent of data"],
        answer: 0,
        feedback: "AI studies systems that perform tasks such as perception, reasoning, language, or decision-making."
      },
      {
        question: "How does a rule-based AI system typically make a decision?",
        options: ["By ignoring its input", "By applying explicit rules to facts or input", "By randomly changing its code", "By training only on unlabeled images"],
        answer: 1,
        feedback: "Rule-based systems apply encoded conditions and rules to the information they receive."
      },
      {
        question: "In an AI workflow, what is inference?",
        options: ["Collecting every possible dataset", "Deleting the model", "Using a trained or configured model to produce an output", "Changing the programming language"],
        answer: 2,
        feedback: "Inference is the process of applying a model to input to obtain a prediction or generated result."
      }
    ],
    "Machine Learning": [
      {
        question: "What distinguishes supervised learning data?",
        options: ["Examples include labels or target values", "It contains no input features", "It is never used for prediction", "It must consist only of images"],
        answer: 0,
        feedback: "Supervised algorithms learn relationships from examples paired with known target labels."
      },
      {
        question: "What is a common unsupervised-learning task?",
        options: ["Predicting a known label from labeled examples", "Grouping similar unlabeled examples", "Manually writing every prediction", "Measuring only training accuracy"],
        answer: 1,
        feedback: "Clustering is an unsupervised task that groups examples using patterns in their features."
      },
      {
        question: "Why evaluate a model on examples it did not train on?",
        options: ["To increase the number of features", "To guarantee perfect accuracy", "To estimate how well it generalizes to unseen data", "To avoid choosing a metric"],
        answer: 2,
        feedback: "A held-out test set helps estimate performance on data the model did not use for fitting."
      }
    ],
    "Neural Networks": [
      {
        question: "What do a neuron's weights determine during a forward pass?",
        options: ["How strongly inputs contribute to its calculation", "The file format of the dataset", "The number of test labels", "The model's display color"],
        answer: 0,
        feedback: "Weights scale input signals and are learned to reduce the network's training objective."
      },
      {
        question: "Why do neural networks use activation functions?",
        options: ["To save model files as images", "To introduce nonlinear transformations", "To remove all learned weights", "To label the test set"],
        answer: 1,
        feedback: "Nonlinear activations let stacked layers represent relationships beyond a single linear transformation."
      },
      {
        question: "What is backpropagation used for during training?",
        options: ["Choosing class names", "Displaying the model architecture", "Computing gradients used to update parameters", "Converting labels to natural language"],
        answer: 2,
        feedback: "Backpropagation computes how the loss changes with parameters so an optimizer can update them."
      }
    ],
    "Generative AI": [
      {
        question: "What is a generative model designed to do?",
        options: ["Create new content based on patterns learned from data", "Only sort database rows", "Guarantee every output is factual", "Replace the need to evaluate outputs"],
        answer: 0,
        feedback: "Generative models produce new text, images, audio, or other content based on learned patterns."
      },
      {
        question: "What is a prompt in a generative AI interaction?",
        options: ["The model's hardware", "Instructions or context supplied to guide a response", "A guaranteed source citation", "A data-cleaning algorithm"],
        answer: 1,
        feedback: "A prompt gives the model the request and context that shape its generated response."
      },
      {
        question: "Why should a generated factual answer be checked?",
        options: ["Generated text cannot be read", "Prompts disable all model training", "A plausible response can still contain unsupported or incorrect claims", "Checking prevents the model from producing text"],
        answer: 2,
        feedback: "Generative models can produce confident-sounding errors, so important claims need independent verification."
      }
    ],
    "AI Project": [
      {
        question: "What is a useful first step when planning an AI project?",
        options: ["Define the problem, intended users, and measurable objective", "Choose the largest model before defining a task", "Train on every available field", "Skip evaluation planning"],
        answer: 0,
        feedback: "A clear problem statement and success measure help determine appropriate data, methods, and evaluation."
      },
      {
        question: "Why should test data be kept separate from model training?",
        options: ["It makes the dataset larger", "It provides a less biased check on unseen-data performance", "It guarantees no missing values", "It removes the need for labels"],
        answer: 1,
        feedback: "Separating test data helps prevent evaluation from simply measuring memorization of training examples."
      },
      {
        question: "Which metric should an AI project use?",
        options: ["Always accuracy, regardless of the task", "The metric with the largest number", "A metric aligned with the problem and costs of different errors", "No metric until deployment"],
        answer: 2,
        feedback: "Metric choice should reflect the task, class balance, and consequences of false positives and false negatives."
      }
    ]
  },
};

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

function getCertificateFilename(courseName) {
  const safeCourseName = String(courseName || "Course")
    .trim()
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "");

  return `${safeCourseName || "Course"}_Certificate.pdf`;
}


function Learning() {

  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  const [moduleNote, setModuleNote] =
    useState("");

  const [moduleNoteSaved, setModuleNoteSaved] =
    useState(false);

  const [isModuleBookmarked, setIsModuleBookmarked] =
    useState(false);

  const [showQuiz, setShowQuiz] =
    useState(false);

  const [quizAnswers, setQuizAnswers] =
    useState({});

  const [quizSubmitted, setQuizSubmitted] =
    useState(false);

  const [quizValidationMessage, setQuizValidationMessage] =
    useState("");


  // =====================================================
  // LOAD LEARNING DATA
  // =====================================================

  useEffect(() => {

    if (!isStudentLoggedIn()) {

      navigate("/student-login");

      return;

    }


    const loggedInStudent =
      getLoggedInStudent();


    if (!loggedInStudent) {

      navigate("/student-login");

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

    setSelectedModule(0);
    setShowQuiz(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizValidationMessage("");

    setEnrolledCourse(
      selectedCourse
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

    const completionDateKey = getCertificateDateKey(
      loggedInStudent.email,
      courseId
    );
    let completedAt = localStorage.getItem(completionDateKey);
    const moduleCount = Array.isArray(selectedCourse.modules)
      ? selectedCourse.modules.length
      : 0;

    if (
      !completedAt &&
      moduleCount > 0 &&
      safeCompletedModules.length >= moduleCount
    ) {
      completedAt = new Date().toISOString();
      localStorage.setItem(completionDateKey, completedAt);
    }

    setCertificateCompletedAt(completedAt);


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

  useEffect(() => {
    if (!student || !courseId) {
      return;
    }

    setModuleNote(
      getModuleNote(
        student.email,
        courseId,
        String(selectedModule)
      ) || ""
    );
    setModuleNoteSaved(false);

    setIsModuleBookmarked(
      getModuleBookmark(
        student.email,
        courseId,
        String(selectedModule)
      )
    );
  }, [student, courseId, selectedModule]);

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
  const currentModuleVideoTitle =
    currentModule?.videoTitle || currentModuleTitle;
  const currentModuleVideoChannel =
    currentModule?.videoChannel || null;

  useEffect(() => {
    if (!modules.length) {
      return;
    }

    const requestedModule = Number(searchParams.get("module"));

    if (
      Number.isInteger(requestedModule) &&
      requestedModule >= 0 &&
      requestedModule < modules.length
    ) {
      setSelectedModule(requestedModule);
    }
  }, [modules, searchParams]);


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

  async function handleDownloadCertificate() {
    if (progress !== 100 || !student) {
      return;
    }

    const { jsPDF } = await import("jspdf");
    const certificate = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });
    const pageWidth = certificate.internal.pageSize.getWidth();
    const pageHeight = certificate.internal.pageSize.getHeight();
    const center = pageWidth / 2;

    certificate.setFillColor(250, 248, 241);
    certificate.rect(0, 0, pageWidth, pageHeight, "F");
    certificate.setFillColor(255, 254, 250);
    certificate.rect(12, 12, pageWidth - 24, pageHeight - 24, "F");

    certificate.setDrawColor(11, 16, 32);
    certificate.setLineWidth(1.1);
    certificate.rect(8, 8, pageWidth - 16, pageHeight - 16);
    certificate.setDrawColor(76, 29, 149);
    certificate.setLineWidth(0.35);
    certificate.rect(11, 11, pageWidth - 22, pageHeight - 22);
    certificate.setDrawColor(212, 175, 55);
    certificate.setLineWidth(0.65);
    certificate.rect(15, 15, pageWidth - 30, pageHeight - 30);

    certificate.setTextColor(11, 16, 32);
    certificate.setFont("helvetica", "bold");
    certificate.setFontSize(9);
    certificate.text("STUDENT COURSE MANAGEMENT SYSTEM", center, 30, {
      align: "center"
    });

    certificate.setFillColor(244, 213, 141);
    certificate.setDrawColor(212, 175, 55);
    certificate.setLineWidth(0.8);
    certificate.circle(pageWidth - 32, 30, 9, "FD");
    certificate.setDrawColor(76, 29, 149);
    certificate.setLineWidth(0.45);
    certificate.circle(pageWidth - 32, 30, 6.8);
    certificate.setTextColor(46, 16, 101);
    certificate.setFont("times", "bold");
    certificate.setFontSize(7);
    certificate.text("SCMS", pageWidth - 32, 31.5, {
      align: "center"
    });

    certificate.setTextColor(11, 16, 32);
    certificate.setFont("times", "bold");
    certificate.setFontSize(27);
    certificate.text("CERTIFICATE OF COMPLETION", center, 51, {
      align: "center"
    });
    certificate.setDrawColor(212, 175, 55);
    certificate.setLineWidth(0.7);
    certificate.line(center - 37, 58, center + 37, 58);
    certificate.setDrawColor(76, 29, 149);
    certificate.setLineWidth(0.35);
    certificate.line(center - 19, 60, center + 19, 60);

    certificate.setTextColor(83, 91, 105);
    certificate.setFont("helvetica", "normal");
    certificate.setFontSize(11);
    certificate.text("This certificate is awarded to", center, 73, {
      align: "center"
    });

    const studentName = String(student.name || "Student");
    let studentNameSize = 26;
    let studentNameLines = [];
    do {
      certificate.setFont("times", "bold");
      certificate.setFontSize(studentNameSize);
      studentNameLines = certificate.splitTextToSize(
        studentName,
        pageWidth - 82
      );
      studentNameSize -= 1;
    } while (studentNameLines.length > 2 && studentNameSize > 15);
    studentNameSize += 1;

    certificate.setTextColor(11, 16, 32);
    certificate.setFont("times", "bold");
    certificate.setFontSize(studentNameSize);
    certificate.text(studentNameLines, center, 91, {
      align: "center"
    });

    certificate.setTextColor(83, 91, 105);
    certificate.setFont("helvetica", "normal");
    certificate.setFontSize(11);
    certificate.text("for successfully completing the course", center, 108, {
      align: "center"
    });

    const certificateCourseName = String(courseName || "Course");
    let courseNameSize = 20;
    let courseNameLines = [];
    do {
      certificate.setFont("times", "bold");
      certificate.setFontSize(courseNameSize);
      courseNameLines = certificate.splitTextToSize(
        certificateCourseName,
        pageWidth - 82
      );
      courseNameSize -= 1;
    } while (courseNameLines.length > 2 && courseNameSize > 13);
    courseNameSize += 1;

    certificate.setTextColor(46, 16, 101);
    certificate.setFont("times", "bold");
    certificate.setFontSize(courseNameSize);
    certificate.text(courseNameLines, center, 127, {
      align: "center"
    });

    certificate.setDrawColor(212, 175, 55);
    certificate.setLineWidth(0.5);
    certificate.line(center - 78, 146, center + 78, 146);
    certificate.setTextColor(76, 29, 149);
    certificate.setFont("helvetica", "bold");
    certificate.setFontSize(8);
    if (courseCode && courseCode !== "COURSE") {
      certificate.text("COURSE CODE", center - 48, 155, {
        align: "center"
      });
      certificate.setTextColor(11, 16, 32);
      certificate.setFont("helvetica", "normal");
      certificate.setFontSize(10);
      certificate.text(
        certificate.splitTextToSize(String(courseCode), 76),
        center - 48,
        164,
        { align: "center" }
      );
    }

    certificate.setTextColor(76, 29, 149);
    certificate.setFont("helvetica", "bold");
    certificate.setFontSize(8);
    const dateCenter = courseCode && courseCode !== "COURSE"
      ? center + 48
      : center;
    certificate.text("COMPLETION DATE", dateCenter, 155, {
      align: "center"
    });
    certificate.setTextColor(11, 16, 32);
    certificate.setFont("helvetica", "normal");
    certificate.setFontSize(10);
    certificate.text(
      certificate.splitTextToSize(formattedCompletionDate, 88),
      dateCenter,
      164,
      { align: "center" }
    );

    certificate.setDrawColor(212, 175, 55);
    certificate.setLineWidth(0.45);
    certificate.line(28, 176, pageWidth - 28, 176);
    certificate.setTextColor(83, 91, 105);
    certificate.setFont("helvetica", "normal");
    certificate.setFontSize(8);
    certificate.text(
      certificate.splitTextToSize(`Certificate ID: ${certificateId}`, 150),
      29,
      185
    );

    certificate.setDrawColor(46, 16, 101);
    certificate.setLineWidth(0.45);
    certificate.line(pageWidth - 100, 180, pageWidth - 29, 180);
    certificate.setTextColor(46, 16, 101);
    certificate.setFont("helvetica", "normal");
    certificate.setFontSize(8);
    certificate.text("Authorized Signature", pageWidth - 64.5, 187, {
      align: "center"
    });

    certificate.setTextColor(11, 16, 32);
    certificate.setFontSize(9);
    certificate.setFont("helvetica", "bold");
    certificate.text("Student Course Management System", center, 193, {
      align: "center"
    });

    certificate.save(getCertificateFilename(courseName));
  }


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

      handleSelectModule(selectedModule + 1);

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
    setQuizAnswers({});

    setQuizSubmitted(false);
    setQuizValidationMessage("");

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

  function handleToggleModuleBookmark() {

    if (!student || !courseId) {
      return;
    }

    const nextValue = !isModuleBookmarked;

    saveModuleBookmark(
      student.email,
      courseId,
      String(selectedModule),
      nextValue
    );

    setIsModuleBookmarked(nextValue);

  }

  function handleSaveModuleNote() {

    if (!student || !courseId) {
      return;
    }

    saveModuleNote(
      student.email,
      courseId,
      String(selectedModule),
      moduleNote
    );

    setModuleNoteSaved(true);

    setTimeout(() => {
      setModuleNoteSaved(false);
    }, 2500);

  }


  // =====================================================
  // QUIZ DATA
  // =====================================================

  const quizQuestions =
    MODULE_QUIZZES[courseCode]?.[currentModuleTitle] || [];


  // =====================================================
  // QUIZ ANSWER
  // =====================================================

  function handleQuizAnswer(
    questionIndex,
    answerIndex
  ) {

    setQuizValidationMessage("");

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

    const unansweredCount = quizQuestions.reduce(
      (count, question, index) =>
        count + (quizAnswers[index] === undefined ? 1 : 0),
      0
    );

    if (unansweredCount > 0) {
      setQuizValidationMessage(
        `Answer all ${quizQuestions.length} questions before submitting. ${unansweredCount} remaining.`
      );
      return;
    }

    const score = quizQuestions.reduce(
      (total, question, index) =>
        total + (quizAnswers[index] === question.answer ? 1 : 0),
      0
    );
    const percentage = Math.round((score / quizQuestions.length) * 100);

    if (student) {
      localStorage.setItem(
        `quizScore_${student.email}_${courseId}_${selectedModule}`,
        JSON.stringify({
          percentage,
          correct: score,
          total: quizQuestions.length
        })
      );
    }

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

                        {getModuleTitle(module)}

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
              🧠 Module Quiz
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
                        {currentModuleTitle}
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
                      Learn: {currentModuleTitle}
                    </h3>


                    <p>
                      This module helps you
                      understand the key concepts
                      of <strong>{currentModuleTitle}</strong>.
                      Read the material, practice
                      the concept and complete the
                      module when you are ready.
                    </p>

                    {currentModuleDescription && (
                      <p className="module-description">
                        {currentModuleDescription}
                      </p>
                    )}


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

                    <section className="recommended-video-panel">
                      <div>
                        <strong>📺 Recommended Lesson Video</strong>
                        <p>{currentModuleVideoTitle}</p>
                      </div>
                      {currentModuleVideoUrl ? (
                        <>
                          <div className="module-video-frame">
                            <iframe
                              src={currentModuleVideoUrl}
                              title={`${courseName}: ${currentModuleVideoTitle}`}
                              allow="encrypted-media; picture-in-picture"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allowFullScreen
                            />
                          </div>
                          {currentModuleVideoChannel && (
                            <p className="module-video-credit">
                              Source: {currentModuleVideoChannel}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="module-video-unavailable">
                          Video not available
                        </span>
                      )}
                    </section>

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
                        handleSelectModule(selectedModule - 1)
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
                      className={`bookmark-module-btn ${isModuleBookmarked ? "active" : ""}`}
                      onClick={handleToggleModuleBookmark}
                    >
                      {isModuleBookmarked ? "★ Bookmarked" : "☆ Bookmark"}
                    </button>


                    <button
                      type="button"
                      className="module-next-btn"
                      disabled={
                        selectedModule ===
                        modules.length - 1
                      }
                      onClick={() =>
                        handleSelectModule(selectedModule + 1)
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
                        MODULE NOTES
                      </span>

                      <h2>
                        📝 Notes for {currentModuleTitle}
                      </h2>

                    </div>

                  </div>


                  <p>
                    Save your personal notes for this module. They will stay available whenever you return to this topic.
                  </p>


                  <textarea
                    value={moduleNote}
                    onChange={(event) =>
                      setModuleNote(
                        event.target.value
                      )
                    }
                    placeholder="Write your notes for this module here..."
                  />


                  <div className="assignment-actions">

                    <button
                      type="button"
                      onClick={
                        handleSaveModuleNote
                      }
                    >
                      💾 Save Notes
                    </button>


                    {moduleNoteSaved && (

                      <span>
                        ✓ Notes saved
                      </span>

                    )}

                  </div>

                </section>

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
                      MODULE QUIZ
                    </span>

                    <h2>
                      🧠 Module Quiz
                    </h2>

                  </div>

                </div>


                <p className="quiz-intro">
                  {courseName} · {currentModuleTitle}
                </p>


                {quizQuestions.length > 0 ? (
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
                          Question {questionIndex + 1} of {quizQuestions.length}: {" "}
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

                        {quizSubmitted && (
                          <div
                            className={`quiz-answer-feedback ${quizAnswers[questionIndex] === question.answer ? "correct" : "incorrect"}`}
                            role="status"
                          >
                            <strong>
                              {quizAnswers[questionIndex] === question.answer
                                ? "Correct"
                                : quizAnswers[questionIndex] === undefined
                                ? "Not answered"
                                : "Not quite"}
                            </strong>
                            <p>{question.feedback}</p>
                            {quizAnswers[questionIndex] !== question.answer && (
                              <p>
                                Correct answer: {question.options[question.answer]}
                              </p>
                            )}
                          </div>
                        )}

                      </div>

                    )
                  )}

                  </div>
                ) : (
                  <p className="quiz-unavailable">
                    A quiz is not available for this module yet.
                  </p>
                )}


                {quizQuestions.length > 0 && (
                  <>
                    <button
                      type="button"
                      className="submit-quiz-btn"
                      onClick={handleQuizSubmit}
                    >
                      Submit Quiz
                    </button>
                    {quizValidationMessage && (
                      <p className="quiz-validation-message" role="alert">
                        {quizValidationMessage}
                      </p>
                    )}
                  </>
                )}


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
          <>
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

            <section className="course-certificate-card">
              <div className="certificate-card-heading">
                <div>
                  <span className="learning-section-label">
                    COURSE COMPLETED!
                  </span>
                  <h2>Certificate of Completion</h2>
                </div>
                <span className="certificate-seal" aria-hidden="true">
                  ✓
                </span>
              </div>
              <p className="certificate-award-copy">
                This certificate is awarded for successfully completing the course.
              </p>
              <dl className="certificate-details">
                <div>
                  <dt>Student</dt>
                  <dd>{student.name}</dd>
                </div>
                <div>
                  <dt>Course</dt>
                  <dd>{courseName}</dd>
                </div>
                {courseCode && courseCode !== "COURSE" && (
                  <div>
                    <dt>Course code</dt>
                    <dd>{courseCode}</dd>
                  </div>
                )}
                <div>
                  <dt>Completion date</dt>
                  <dd>{formattedCompletionDate}</dd>
                </div>
                <div className="certificate-id-detail">
                  <dt>Certificate ID</dt>
                  <dd>{certificateId}</dd>
                </div>
              </dl>
              <div className="certificate-card-footer">
                <span>Student Course Management System</span>
                <button
                  type="button"
                  className="certificate-download-btn"
                  onClick={handleDownloadCertificate}
                >
                  Download Certificate
                </button>
              </div>
            </section>
          </>
        )}

      </main>


      <Footer />

    </>

  );

}


export default Learning;