import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";

import api, { getApiErrorMessage } from "../services/api";
import { isValidPassword, passwordsMatch } from "../modules/validation";
import { showError, showSuccess } from "../modules/ui";

function readResetToken() {
  return new URLSearchParams(
    window.location.hash.slice(1)
  ).get("token") || "";
}

function clearResetTokenFromUrl() {
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}`
  );
}

function ResetPassword() {

  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token] = useState(readResetToken);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clearResetTokenFromUrl();
  }, []);

  async function handleReset(event) {
    event.preventDefault();

    if (!token) {
      showError(
        "Password reset link is invalid or expired. Please request a new one."
      );
      navigate("/forgot-password");
      return;
    }

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

    try {
      setLoading(true);
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword: password
      });

      showSuccess(
        response.data.message ||
          "Password reset successfully. Please sign in again."
      );
      navigate("/student-login");
    } catch (error) {
      showError(
        getApiErrorMessage(
          error,
          "Unable to reset the password. Please request a new reset link."
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


          <button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;