import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";

import { getStudents } from "../modules/auth";
import { isValidEmail } from "../modules/validation";
import { showError, showSuccess } from "../modules/ui";

function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  function handleSubmit(event) {

    event.preventDefault();

    const enteredEmail =
      email.trim().toLowerCase();


    /* ==============================
       VALIDATE EMAIL
    ============================== */

    if (!isValidEmail(enteredEmail)) {

      showError(
        "Please enter a valid email address."
      );

      return;
    }


    /* ==============================
       GET ALL STUDENTS
    ============================== */

    const students = getStudents();


    /* ==============================
       FIND STUDENT
    ============================== */

    const student = students.find(
      (item) =>
        item.email === enteredEmail
    );


    if (!student) {

      showError(
        "No account found with this email address."
      );

      return;
    }


    /* ==============================
       STORE RESET EMAIL
    ============================== */

    localStorage.setItem(
      "resetPasswordEmail",
      enteredEmail
    );


    showSuccess(
      "Account found. You can now reset your password."
    );


    navigate("/reset-password");
  }


  return (

    <>

      <Navbar />

      <main className="login-page">

        <h1>
          🔑 Forgot Password
        </h1>

        <p>
          Enter your registered email address
          to reset your password.
        </p>


        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <br />
          <br />

          <button type="submit">
            Continue
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

export default ForgotPassword;