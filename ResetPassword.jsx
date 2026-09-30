import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleResetPassword(event) {
    event.preventDefault();

    const resetEmail = localStorage.getItem("resetEmail");
    const savedStudent =
      JSON.parse(localStorage.getItem("student"));

    if (!resetEmail || !savedStudent) {
      alert("Password reset session expired.");
      navigate("/login");
      return;
    }

    if (password.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const updatedStudent = {
      ...savedStudent,
      password: password
    };

    localStorage.setItem(
      "student",
      JSON.stringify(updatedStudent)
    );

    localStorage.removeItem("resetEmail");

    alert("Password reset successful!");

    navigate("/login");
  }

  return (
    <>
      <Navbar />

      <main className="login-page">
        <h1>Reset Password</h1>

        <p>Create a new password for your account.</p>

        <form onSubmit={handleResetPassword}>

          <input
            type={showPassword ? "text" : "password"}
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
            type={showPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            required
          />

          <br />

          <label>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(event) =>
                setShowPassword(event.target.checked)
              }
            />
            Show Password
          </label>

          <br />
          <br />

          <button type="submit">
            Reset Password
          </button>

        </form>
      </main>

      <Footer />
    </>
  );
}

export default ResetPassword;