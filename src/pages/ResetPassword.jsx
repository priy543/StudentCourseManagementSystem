import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";

import { getStudents, saveStudents } from "../modules/auth";
import { isValidPassword, passwordsMatch } from "../modules/validation";
import { showError, showSuccess } from "../modules/ui";

function ResetPassword() {

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  function handleReset(event) {

    event.preventDefault();


    /* ==============================
       GET RESET EMAIL
    ============================== */

    const resetEmail =
      localStorage.getItem("resetPasswordEmail");


    if (!resetEmail) {

      showError(
        "Password reset session expired. Please try again."
      );

      navigate("/forgot-password");

      return;
    }


    /* ==============================
       PASSWORD VALIDATION
    ============================== */

    if (!isValidPassword(password)) {

      showError(
        "Password must contain at least 8 characters."
      );

      return;
    }


    if (!passwordsMatch(password, confirmPassword)) {

      showError(
        "Passwords do not match."
      );

      return;
    }


    /* ==============================
       GET STUDENTS
    ============================== */

    const students = getStudents();


    /* ==============================
       FIND STUDENT
    ============================== */

    const studentIndex =
      students.findIndex(
        (student) =>
          student.email === resetEmail
      );


    if (studentIndex === -1) {

      showError(
        "Student account could not be found."
      );

      localStorage.removeItem(
        "resetPasswordEmail"
      );

      navigate("/forgot-password");

      return;
    }


    /* ==============================
       UPDATE PASSWORD
    ============================== */

    students[studentIndex] = {

      ...students[studentIndex],

      password: password

    };


    /* ==============================
       SAVE STUDENTS
    ============================== */

    saveStudents(students);


    /* ==============================
       CLEAR RESET SESSION
    ============================== */

    localStorage.removeItem(
      "resetPasswordEmail"
    );


    showSuccess(
      "Password reset successfully!"
    );


    navigate("/login");
  }


  return (

    <>

      <Navbar />

      <main className="login-page">

        <h1>
          🔐 Reset Password
        </h1>

        <p>
          Create a new password for your account.
        </p>


        <form onSubmit={handleReset}>

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          <br />
          <br />


          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            required
          />

          <br />
          <br />


          <button type="submit">
            Reset Password
          </button>

        </form>


        <p>
          Remember your password?{" "}

          <Link to="/login">
            Login
          </Link>

        </p>

      </main>

      <Footer />

    </>

  );
}

export default ResetPassword;