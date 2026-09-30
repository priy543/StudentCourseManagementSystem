// ==========================================
// UI MODULE
// ==========================================

// Show success message
export function showSuccess(
  message
) {
  alert("✅ " + message);
}

// Show error message
export function showError(
  message
) {
  alert("❌ " + message);
}

// Show information
export function showInfo(
  message
) {
  alert("ℹ️ " + message);
}

// Confirm action
export function confirmAction(
  message
) {
  return window.confirm(
    message
  );
}

// Format progress
export function formatProgress(
  progress
) {
  return `${progress || 0}%`;
}

// Calculate average progress
export function calculateAverageProgress(
  courses
) {
  if (!courses.length) {
    return 0;
  }

  const total =
    courses.reduce(
      (sum, course) =>
        sum +
        (course.progress || 0),
      0
    );

  return Math.round(
    total / courses.length
  );
}

// Scroll to top
export function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// Clear application data
export function clearApplicationData() {
  const confirmed =
    window.confirm(
      "Are you sure you want to clear all demo data?"
    );

  if (!confirmed) {
    return;
  }

  localStorage.clear();

  window.location.href = "/";
}