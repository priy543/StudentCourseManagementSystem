// ==========================================
// AUTHENTICATION MODULE
// ==========================================

// Get all registered students
export function getStudents() {
  try {
    const students = JSON.parse(
      localStorage.getItem("students") || "[]"
    );

    return Array.isArray(students)
      ? students
      : [];
  } catch (error) {
    console.error(
      "Error loading students:",
      error
    );

    return [];
  }
}

// Save students
export function saveStudents(students) {
  localStorage.setItem(
    "students",
    JSON.stringify(students)
  );
}

// Get logged-in student
export function getLoggedInStudent() {
  const email =
    localStorage.getItem(
      "loggedInUser"
    );

  if (!email) {
    return null;
  }

  const students = getStudents();

  const localStudent =
    students.find(
      (student) =>
        student.email === email
    );

  if (localStudent) {
    return localStudent;
  }

  try {
    const sessionStudent = JSON.parse(
      sessionStorage.getItem("student") || "null"
    );

    return sessionStudent?.email === email
      ? sessionStudent
      : null;
  } catch {
    return null;
  }
}

export function updateStudentProfile(
  email,
  profile
) {
  const students = getStudents();
  const normalizedEmail =
    String(email || "").trim().toLowerCase();
  const studentIndex =
    students.findIndex(
      (student) =>
        student.email === normalizedEmail
    );

  if (studentIndex === -1) {
    return {
      success: false,
      message: "Student account not found."
    };
  }

  const name =
    typeof profile?.name === "string"
      ? profile.name.trim()
      : "";
  const department =
    typeof profile?.department === "string"
      ? profile.department.trim()
      : "";
  const course =
    typeof profile?.course === "string"
      ? profile.course.trim()
      : "";

  if (!name || !department || !course) {
    return {
      success: false,
      message: "Name, department, and course are required."
    };
  }

  const updatedStudent = {
    ...students[studentIndex],
    name,
    department,
    course
  };

  students[studentIndex] = updatedStudent;
  saveStudents(students);

  return {
    success: true,
    student: updatedStudent
  };
}

// Check student login
export function isStudentLoggedIn() {
  return Boolean(
    localStorage.getItem(
      "loggedInUser"
    )
  );
}

// Student logout
export function logoutStudent() {
  localStorage.removeItem(
    "loggedInUser"
  );

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("student");
}

export function isAdminLoggedIn() {
  if (!sessionStorage.getItem("token")) {
    return false;
  }

  try {
    const student = JSON.parse(
      sessionStorage.getItem("student") || "null"
    );

    return student?.role === "admin";
  } catch {
    return false;
  }
}

export function logoutAdmin() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("student");
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("adminLoggedIn");
}