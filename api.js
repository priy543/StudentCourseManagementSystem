// ==========================================
// API / DATA MANAGEMENT MODULE
// ==========================================


// ==========================================
// DEFAULT COURSES
// ==========================================

export function getDefaultCourses() {
  return [
    {
      id: 1,
      name: "Python Programming",
      instructor: "John Smith",
      duration: "3 Months",
      description:
        "Learn Python programming from basic to advanced concepts."
    },

    {
      id: 2,
      name: "Web Development",
      instructor: "David Kumar",
      duration: "4 Months",
      description:
        "Learn HTML, CSS, JavaScript and React."
    },

    {
      id: 3,
      name: "Artificial Intelligence",
      instructor: "Priya Sharma",
      duration: "6 Months",
      description:
        "Learn machine learning and artificial intelligence."
    }
  ];
}


// ==========================================
// GET ALL COURSES
// ==========================================

export function getCourses() {
  try {
    const storedCourses =
      localStorage.getItem("adminCourses");

    // No admin courses yet
    if (!storedCourses) {
      return getDefaultCourses();
    }

    const adminCourses =
      JSON.parse(storedCourses);

    // Make sure stored data is an array
    if (!Array.isArray(adminCourses)) {
      return getDefaultCourses();
    }

    return [
      ...getDefaultCourses(),
      ...adminCourses
    ];

  } catch (error) {

    console.error(
      "Error loading courses:",
      error
    );

    return getDefaultCourses();
  }
}


// ==========================================
// SAVE ADMIN COURSES
// ==========================================

export function saveCourses(courses) {
  localStorage.setItem(
    "adminCourses",
    JSON.stringify(courses)
  );
}


// ==========================================
// GET ENROLLED COURSES
// ==========================================

export function getEnrolledCourses(email) {

  try {

    return (
      JSON.parse(
        localStorage.getItem(
          `enrolledCourses_${email}`
        )
      ) || []
    );

  } catch (error) {

    console.error(
      "Error loading enrolled courses:",
      error
    );

    return [];
  }
}


// ==========================================
// SAVE ENROLLED COURSES
// ==========================================

export function saveEnrolledCourses(
  email,
  courses
) {

  localStorage.setItem(
    `enrolledCourses_${email}`,
    JSON.stringify(courses)
  );
}


// ==========================================
// ENROLL STUDENT
// ==========================================

export function enrollStudent(
  email,
  course
) {

  const courses =
    getEnrolledCourses(email);

  // Check whether already enrolled
  const exists = courses.some(
    (item) =>
      Number(item.id) ===
      Number(course.id)
  );

  if (exists) {

    return {
      success: false,
      message:
        "You are already enrolled in this course."
    };
  }


  const enrolledCourse = {
    ...course,
    progress: 0,
    completedModules: []
  };


  courses.push(enrolledCourse);

  saveEnrolledCourses(
    email,
    courses
  );


  return {
    success: true,
    message:
      `Successfully enrolled in ${course.name}!`
  };
}


// ==========================================
// UPDATE COURSE PROGRESS
// ==========================================

export function updateCourseProgress(
  email,
  courseId,
  progress,
  completedModules = []
) {

  const courses =
    getEnrolledCourses(email);


  const updatedCourses =
    courses.map((course) => {

      if (
        Number(course.id) ===
        Number(courseId)
      ) {

        return {
          ...course,
          progress,
          completedModules
        };
      }

      return course;
    });


  saveEnrolledCourses(
    email,
    updatedCourses
  );


  return updatedCourses;
}


// ==========================================
// SAVE ASSIGNMENT
// ==========================================

export function saveAssignment(
  email,
  courseId,
  moduleId,
  assignment
) {

  localStorage.setItem(
    `assignment_${email}_${courseId}_${moduleId}`,
    JSON.stringify(assignment)
  );
}


// ==========================================
// GET ASSIGNMENT
// ==========================================

export function getAssignment(
  email,
  courseId,
  moduleId
) {

  try {

    return JSON.parse(
      localStorage.getItem(
        `assignment_${email}_${courseId}_${moduleId}`
      )
    );

  } catch (error) {

    console.error(
      "Error loading assignment:",
      error
    );

    return null;
  }
}


// ==========================================
// GET COMPLETED MODULES
// ==========================================

export function getCompletedModules(
  email,
  courseId
) {

  try {

    return (
      JSON.parse(
        localStorage.getItem(
          `completedModules_${email}_${courseId}`
        )
      ) || []
    );

  } catch (error) {

    console.error(
      "Error loading completed modules:",
      error
    );

    return [];
  }
}


// ==========================================
// SAVE COMPLETED MODULES
// ==========================================

export function saveCompletedModules(
  email,
  courseId,
  modules
) {

  localStorage.setItem(
    `completedModules_${email}_${courseId}`,
    JSON.stringify(modules)
  );
}


// ==========================================
// GET ALL STUDENTS
// ==========================================

export function getAllStudents() {

  try {

    return (
      JSON.parse(
        localStorage.getItem("students")
      ) || []
    );

  } catch (error) {

    console.error(
      "Error loading students:",
      error
    );

    return [];
  }
}


// ==========================================
// GET ALL ENROLLMENTS
// ==========================================

export function getAllEnrollments() {

  const students =
    getAllStudents();

  const enrollments = [];


  // Search all localStorage keys
  for (
    let index = 0;
    index < localStorage.length;
    index++
  ) {

    const key =
      localStorage.key(index);


    // Only process enrolledCourses keys
    if (
      !key ||
      !key.startsWith(
        "enrolledCourses_"
      )
    ) {
      continue;
    }


    // Extract student email
    const studentEmail =
      key.replace(
        "enrolledCourses_",
        ""
      );


    let courses;


    // Safely read course data
    try {

      courses =
        JSON.parse(
          localStorage.getItem(key)
        ) || [];

    } catch (error) {

      console.error(
        "Error reading enrollment data:",
        error
      );

      courses = [];
    }


    // Make sure courses is an array
    if (!Array.isArray(courses)) {
      continue;
    }


    // Find student
    const student =
      students.find(
        (item) =>
          item.email ===
          studentEmail
      );


    // Create enrollment records
    courses.forEach((course) => {

      enrollments.push({

        ...course,

        studentEmail:
          studentEmail,

        studentName:
          student?.name ||
          studentEmail,

        courseName:
          course.courseName ||
          course.name,

        progress:
          Number(
            course.progress || 0
          )
      });

    });
  }


  return enrollments;
}