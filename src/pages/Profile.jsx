import { useState } from "react";
import {
  Navigate,
  useNavigate
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  changeStudentPassword,
  getLoggedInStudent,
  isStudentLoggedIn,
  logoutStudent,
  updateStudentProfile
} from "../modules/auth";

import {
  isValidName
} from "../modules/validation";

function Profile() {
  const navigate = useNavigate();
  const [student, setStudent] =
    useState(() => getLoggedInStudent());
  const [profile, setProfile] =
    useState(() => {
      const currentStudent = getLoggedInStudent();

      return {
        name: currentStudent?.name || "",
        department: currentStudent?.department || "",
        course: currentStudent?.course || ""
      };
    });
  const [profileFeedback, setProfileFeedback] =
    useState(null);
  const [passwordFields, setPasswordFields] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  const [passwordFeedback, setPasswordFeedback] =
    useState(null);

  if (!isStudentLoggedIn() || !student) {
    return <Navigate to="/login" replace />;
  }

  function handleProfileChange(event) {
    setProfile((previousProfile) => ({
      ...previousProfile,
      [event.target.name]: event.target.value
    }));
  }

  function handleProfileSubmit(event) {
    event.preventDefault();
    setProfileFeedback(null);

    if (!isValidName(profile.name)) {
      setProfileFeedback({
        type: "error",
        message: "Enter a valid name."
      });
      return;
    }

    if (!profile.department.trim() || !profile.course.trim()) {
      setProfileFeedback({
        type: "error",
        message: "Department and course are required."
      });
      return;
    }

    const result = updateStudentProfile(
      student.email,
      profile
    );

    if (!result.success) {
      setProfileFeedback({
        type: "error",
        message: result.message
      });
      return;
    }

    setStudent(result.student);
    setProfile({
      name: result.student.name,
      department: result.student.department,
      course: result.student.course
    });
    setProfileFeedback({
      type: "success",
      message: "Profile updated successfully."
    });
  }

  function handlePasswordChange(event) {
    setPasswordFields((previousFields) => ({
      ...previousFields,
      [event.target.name]: event.target.value
    }));
  }

  function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordFeedback(null);

    const result = changeStudentPassword(
      student.email,
      passwordFields.currentPassword,
      passwordFields.newPassword,
      passwordFields.confirmPassword
    );

    if (!result.success) {
      setPasswordFeedback({
        type: "error",
        message: result.message
      });
      return;
    }

    setPasswordFields({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setPasswordFeedback({
      type: "success",
      message: result.message
    });
  }

  function handleLogout() {
    logoutStudent();
    navigate("/login");
  }

  return (
    <>
      <Navbar />

      <main className="student-profile-page">
        <header className="profile-page-header">
          <div>
            <span className="dashboard-label">STUDENT ACCOUNT</span>
            <h1>Profile &amp; Account</h1>
            <p>Review your student details and account security.</p>
          </div>

          <button
            type="button"
            className="profile-logout-button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </header>

        <div className="profile-page-layout">
          <section className="profile-overview-card" aria-labelledby="profile-overview-title">
            <div className="profile-overview-heading">
              <div className="profile-avatar" aria-hidden="true">
                {student.name?.charAt(0).toUpperCase() || "S"}
              </div>
              <div>
                <h2 id="profile-overview-title">Student details</h2>
                <p>{student.email}</p>
              </div>
            </div>

            <div className="profile-facts">
              <div className="profile-fact">
                <span>Name</span>
                <strong>{student.name}</strong>
              </div>
              <div className="profile-fact">
                <span>Email</span>
                <strong>{student.email}</strong>
              </div>
              <div className="profile-fact">
                <span>Department</span>
                <strong>{student.department || "Not specified"}</strong>
              </div>
              <div className="profile-fact">
                <span>Course</span>
                <strong>{student.course || "Not specified"}</strong>
              </div>
              <div className="profile-fact">
                <span>Student ID</span>
                <strong>{student.id ?? "Not assigned"}</strong>
              </div>
            </div>
          </section>

          <div className="profile-form-stack">
            <section className="profile-form-card" aria-labelledby="edit-profile-title">
              <h2 id="edit-profile-title">Edit profile</h2>
              <p>Your email and student ID cannot be changed here.</p>

              <form onSubmit={handleProfileSubmit}>
                <div className="profile-form-fields">
                  <label className="profile-field" htmlFor="profile-name">
                    Name
                    <input
                      id="profile-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      required
                    />
                  </label>

                  <label className="profile-field" htmlFor="profile-department">
                    Department
                    <input
                      id="profile-department"
                      name="department"
                      type="text"
                      value={profile.department}
                      onChange={handleProfileChange}
                      required
                    />
                  </label>

                  <label className="profile-field" htmlFor="profile-course">
                    Course
                    <input
                      id="profile-course"
                      name="course"
                      type="text"
                      value={profile.course}
                      onChange={handleProfileChange}
                      required
                    />
                  </label>
                </div>

                <div className="profile-form-actions">
                  <button className="profile-primary-button" type="submit">
                    Save profile
                  </button>
                </div>

                {profileFeedback && (
                  <p
                    className={`profile-feedback ${profileFeedback.type}`}
                    role={profileFeedback.type === "error" ? "alert" : "status"}
                  >
                    {profileFeedback.message}
                  </p>
                )}
              </form>
            </section>

            <section className="profile-form-card" aria-labelledby="change-password-title">
              <h2 id="change-password-title">Change password</h2>
              <p>Confirm your current password before choosing a new one.</p>

              <form onSubmit={handlePasswordSubmit}>
                <div className="profile-form-fields">
                  <label className="profile-field" htmlFor="current-password">
                    Current password
                    <input
                      id="current-password"
                      name="currentPassword"
                      type="password"
                      autoComplete="current-password"
                      value={passwordFields.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </label>

                  <label className="profile-field" htmlFor="new-password">
                    New password
                    <input
                      id="new-password"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      value={passwordFields.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </label>

                  <label className="profile-field" htmlFor="confirm-new-password">
                    Confirm new password
                    <input
                      id="confirm-new-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={passwordFields.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </label>
                </div>

                <div className="profile-form-actions">
                  <button className="profile-primary-button" type="submit">
                    Update password
                  </button>
                </div>

                {passwordFeedback && (
                  <p
                    className={`profile-feedback ${passwordFeedback.type}`}
                    role={passwordFeedback.type === "error" ? "alert" : "status"}
                  >
                    {passwordFeedback.message}
                  </p>
                )}
              </form>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Profile;