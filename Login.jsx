import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(event) {

    event.preventDefault();

    const savedStudent =
      JSON.parse(localStorage.getItem("student"));

    if (!savedStudent) {
      alert("No Registered User Found!");
      return;
    }

    if (
      savedStudent.email === email &&
      savedStudent.password === password
    ) {

      localStorage.setItem(
        "loggedInUser",
        savedStudent.email
      );

      alert("Login Successful!");

      navigate("/dashboard");

    } else {

      alert("Invalid Email or Password");

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
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <br /><br />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          <br /><br />

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
  <Link to="/register">Register</Link>
</p>

      </main>

      <Footer />
    </>
  );
}

export default Login;