
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Link,
  useNavigate
} from "react-router-dom";

import api from "../services/api";

import {
  validateLogin
} from "../modules/validation";

import {
  showSuccess,
  showError
} from "../modules/ui";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    const errors = validateLogin(email, password);

    if (Object.keys(errors).length) {
      showError(Object.values(errors)[0]);
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password
      });

      const { token, student } = response.data;

      if (!token || !student) {
        showError("The server did not return the expected login details.");
        return;
      }

      // Store JWT and student details for this browser session.
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("student", JSON.stringify(student));

      // Preserve compatibility with existing student page guards.
      localStorage.setItem("loggedInUser", student.email);

      showSuccess("Login Successful!");

      navigate("/dashboard");
    } catch (error) {
      showError(
        error.response?.data?.message ||
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="login-page">
        <h1>Student Login</h1>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <br />
          <br />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <br />
          <br />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p>
          <Link to="/forgot-password">
            Forgot Password?
          </Link>
        </p>

        <p>
          Don't have an account?{" "}
          <Link to="/student-register">
            Register
          </Link>
        </p>
      </main>

      <Footer />
    </>
  );
}

export default Login;
