import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  loginStudent
} from "../modules/auth";

import {
  validateLogin
} from "../modules/validation";

import {
  showSuccess,
  showError
} from "../modules/ui";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  function handleLogin(event) {
    event.preventDefault();

    const errors =
      validateLogin(
        email,
        password
      );

    if (Object.keys(errors).length) {
      showError(
        Object.values(errors)[0]
      );
      return;
    }

    const result =
      loginStudent(
        email,
        password
      );

    if (!result.success) {
      showError(result.message);
      return;
    }

    showSuccess(
      "Login Successful!"
    );

    navigate("/dashboard");
  }

  return (
    <>
      <Navbar />

      <main className="login-page">

        <h1>Student Login</h1>

        <form
          onSubmit={handleLogin}
        >

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            required
          />

          <br />
          <br />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            required
          />

          <br />
          <br />

          <button type="submit">
            Login
          </button>

        </form>

        <p>
          <Link to="/forgot-password">
            Forgot Password?
          </Link>
        </p>

        <p>
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>

      </main>

      <Footer />
    </>
  );
}

export default Login;