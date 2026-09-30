import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function AdminLogin() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleAdminLogin(event) {

    event.preventDefault();

    const adminEmail = "admin@gmail.com";
    const adminPassword = "admin123";

    // Remove accidental spaces from email
    const enteredEmail =
      email.trim().toLowerCase();

    if (
      enteredEmail === adminEmail &&
      password === adminPassword
    ) {

      localStorage.setItem(
        "adminLoggedIn",
        "true"
      );

      alert("Admin Login Successful!");

      navigate("/admin-dashboard");

    } else {

      alert(
        "Invalid Admin Email or Password"
      );

    }
  }


  return (
    <>
      <Navbar />

      <main className="login-page">

        <h1>🔐 Admin Login</h1>

        <p>
          Login to manage courses and students.
        </p>

        <form onSubmit={handleAdminLogin}>

          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <br />
          <br />

          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          <br />
          <br />

          <button type="submit">
            Admin Login
          </button>

        </form>

      </main>

      <Footer />
    </>
  );
}

export default AdminLogin;