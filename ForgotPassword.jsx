import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  function handleForgotPassword(event) {
    event.preventDefault();

    const savedStudent =
      JSON.parse(localStorage.getItem("student"));

    if (!savedStudent) {
      alert("No registered student found.");
      return;
    }

    if (savedStudent.email !== email) {
      alert("Email address not found.");
      return;
    }

    // Demo reset information
    localStorage.setItem("resetEmail", email);

    alert("Email verified. You can now reset your password.");

    navigate("/reset-password");
  }

  return (
    <>
      <Navbar />

      <main className="login-page">
        <h1>Forgot Password</h1>

        <p>
          Enter your registered email address to reset
          your password.
        </p>

        <form onSubmit={handleForgotPassword}>
          <input
            type="email"
            placeholder="Enter Email Address"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <br />
          <br />

          <button type="submit">
            Verify Email
          </button>
        </form>
      </main>

      <Footer />
    </>
  );
}

export default ForgotPassword;