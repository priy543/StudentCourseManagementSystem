import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

import api, { getApiErrorMessage } from "../services/api";
import { isValidEmail } from "../modules/validation";
import { showError, showSuccess } from "../modules/ui";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const enteredEmail =
      email.trim().toLowerCase();

    if (!isValidEmail(enteredEmail)) {
      showError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/forgot-password", {
        email: enteredEmail
      });

      showSuccess(
        response.data.message ||
          "If an account with that email exists, password reset instructions will be sent."
      );
    } catch (error) {
      showError(
        getApiErrorMessage(
          error,
          "Unable to request a password reset. Please try again later."
        )
      );
    } finally {
      setLoading(false);
    }
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

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Continue"}
          </button>

        </form>


        <p>
          Remember your password?{" "}

          <Link to="/student-login">
            Login
          </Link>

        </p>

      </main>

      <Footer />

    </>

  );
}

export default ForgotPassword;