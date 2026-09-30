// ==========================================
// AUTHENTICATION MODULE
// ==========================================

// Get all registered students
export function getStudents() {
  return (
    JSON.parse(
      localStorage.getItem("students")
    ) || []
  );
}

// Save students
export function saveStudents(students) {
  localStorage.setItem(
    "students",
    JSON.stringify(students)
  );
}

// Register student
export function registerStudent(student) {
  const students = getStudents();

  const email =
    student.email.trim().toLowerCase();

  const existingStudent =
    students.find(
      (item) => item.email === email
    );

  if (existingStudent) {
    return {
      success: false,
      message:
        "An account with this email already exists."
    };
  }

  const newStudent = {
    id: Date.now(),
    name: student.name.trim(),
    email,
    password: student.password,
    department: student.department.trim(),
    course: student.course
  };

  students.push(newStudent);

  saveStudents(students);

  return {
    success: true,
    message:
      "Registration successful!"
  };
}

// Login student
export function loginStudent(
  email,
  password
) {
  const students = getStudents();

  const enteredEmail =
    email.trim().toLowerCase();

  const student =
    students.find(
      (item) =>
        item.email === enteredEmail &&
        item.password === password
    );

  if (!student) {
    return {
      success: false,
      message:
        "Invalid email or password."
    };
  }

  localStorage.setItem(
    "loggedInUser",
    student.email
  );

  return {
    success: true,
    student
  };
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

  return (
    students.find(
      (student) =>
        student.email === email
    ) || null
  );
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
}

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

export function loginAdmin(
  email,
  password
) {
  const adminEmail =
    "admin@gmail.com";

  const adminPassword =
    "admin123";

  if (
    email.trim().toLowerCase() ===
      adminEmail &&
    password === adminPassword
  ) {
    localStorage.setItem(
      "adminLoggedIn",
      "true"
    );

    return {
      success: true,
      message:
        "Admin login successful."
    };
  }

  return {
    success: false,
    message:
      "Invalid admin email or password."
  };
}

export function isAdminLoggedIn() {
  return (
    localStorage.getItem(
      "adminLoggedIn"
    ) === "true"
  );
}

export function logoutAdmin() {
  localStorage.removeItem(
    "adminLoggedIn"
  );
}