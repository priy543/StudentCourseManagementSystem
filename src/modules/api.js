// ==========================================
// API / DATA MANAGEMENT MODULE
// ==========================================


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
      String(item.id) ===
      String(course.id)
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
        String(course.id) ===
        String(courseId)
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
// SAVE MODULE NOTE
// ==========================================

export function saveModuleNote(
  email,
  courseId,
  moduleId,
  note
) {
  localStorage.setItem(
    `moduleNote_${email}_${courseId}_${moduleId}`,
    JSON.stringify(note || "")
  );
}


// ==========================================
// GET MODULE NOTE
// ==========================================

export function getModuleNote(
  email,
  courseId,
  moduleId
) {

  try {

    const savedNote = JSON.parse(
      localStorage.getItem(
        `moduleNote_${email}_${courseId}_${moduleId}`
      )
    );

    return typeof savedNote === "string"
      ? savedNote
      : "";

  } catch (error) {

    console.error(
      "Error loading module note:",
      error
    );

    return "";
  }
}


// ==========================================
// SAVE MODULE BOOKMARK
// ==========================================

export function saveModuleBookmark(
  email,
  courseId,
  moduleId,
  isBookmarked
) {
  localStorage.setItem(
    `moduleBookmark_${email}_${courseId}_${moduleId}`,
    JSON.stringify(Boolean(isBookmarked))
  );
}


// ==========================================
// GET MODULE BOOKMARK
// ==========================================

export function getModuleBookmark(
  email,
  courseId,
  moduleId
) {

  try {

    const savedBookmark = JSON.parse(
      localStorage.getItem(
        `moduleBookmark_${email}_${courseId}_${moduleId}`
      )
    );

    return savedBookmark === true;

  } catch (error) {

    console.error(
      "Error loading module bookmark:",
      error
    );

    return false;
  }
}


// ==========================================
// GET BOOKMARKED MODULES
// ==========================================

export function getBookmarkedModules(email) {

  if (!email) {
    return [];
  }

  const prefix = `moduleBookmark_${email}_`;
  const bookmarkedModules = [];

  for (
    let index = 0;
    index < localStorage.length;
    index += 1
  ) {

    const key = localStorage.key(index);

    if (!key || !key.startsWith(prefix)) {
      continue;
    }

    try {

      const isBookmarked = JSON.parse(
        localStorage.getItem(key)
      );

      if (isBookmarked !== true) {
        continue;
      }

      const remainder = key.slice(prefix.length);
      const [courseId, ...moduleParts] = remainder.split("_");

      bookmarkedModules.push({
        courseId,
        moduleId: moduleParts.length > 0 ? moduleParts.join("_") : "0"
      });

    } catch (error) {

      console.error(
        "Error loading bookmarked module:",
        error
      );
    }
  }

  return bookmarkedModules;
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