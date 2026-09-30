// ==========================================
// VALIDATION MODULE
// ==========================================

// Required field
export function required(value) {
  return (
    value !== undefined &&
    value !== null &&
    value.trim() !== ""
  );
}

// Email validation
export function isValidEmail(email) {
  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(
    email.trim()
  );
}

// Password validation
export function isValidPassword(
  password
) {
  return password.length >= 8;
}

// Confirm password
export function passwordsMatch(
  password,
  confirmPassword
) {
  return password === confirmPassword;
}

// Name validation
export function isValidName(name) {
  const namePattern =
    /^[A-Za-z ]{2,50}$/;

  return namePattern.test(
    name.trim()
  );
}

// Registration validation
export function validateRegistration(
  formData
) {
  const errors = {};

  if (!required(formData.name)) {
    errors.name =
      "Name is required.";
  } else if (
    !isValidName(formData.name)
  ) {
    errors.name =
      "Enter a valid name.";
  }

  if (!required(formData.email)) {
    errors.email =
      "Email is required.";
  } else if (
    !isValidEmail(formData.email)
  ) {
    errors.email =
      "Enter a valid email.";
  }

  if (!required(formData.password)) {
    errors.password =
      "Password is required.";
  } else if (
    !isValidPassword(
      formData.password
    )
  ) {
    errors.password =
      "Password must contain at least 8 characters.";
  }

  if (
    !passwordsMatch(
      formData.password,
      formData.confirmPassword
    )
  ) {
    errors.confirmPassword =
      "Passwords do not match.";
  }

  if (
    !required(formData.department)
  ) {
    errors.department =
      "Department is required.";
  }

  if (!required(formData.course)) {
    errors.course =
      "Please select a course.";
  }

  return errors;
}

// Login validation
export function validateLogin(
  email,
  password
) {
  const errors = {};

  if (!required(email)) {
    errors.email =
      "Email is required.";
  } else if (
    !isValidEmail(email)
  ) {
    errors.email =
      "Enter a valid email.";
  }

  if (!required(password)) {
    errors.password =
      "Password is required.";
  }

  return errors;
}