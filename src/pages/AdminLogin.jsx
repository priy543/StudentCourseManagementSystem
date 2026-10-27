import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

import api, { getApiErrorMessage } from "../services/api";
import { logoutAdmin } from "../modules/auth";

import {
  showSuccess,
  showError
} from "../modules/ui";

import {
  validateLogin
} from "../modules/validation";


function AdminLogin() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


  async function handleAdminLogin(event) {
    event.preventDefault();

    const errors =
      validateLogin(
        email,
        password
      );


    if (Object.keys(errors).length > 0) {

      showError(
        Object.values(errors)[0]
      );

      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password
      });
      const { token, student } = response.data;

      if (!token || !student || typeof student.role !== "string") {
        showError("The server did not return valid login details.");
        return;
      }

      if (student.role !== "admin") {
        logoutAdmin();
        showError("Access denied. This account does not have administrator privileges.");
        return;
      }

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("student", JSON.stringify(student));
      localStorage.setItem("loggedInUser", student.email);

      showSuccess("Admin login successful!");
      navigate("/admin/overview");
    } catch (error) {
      showError(
        getApiErrorMessage(
          error,
          "Unable to connect to the server. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  }


  return (

    <>

      <Navbar />

      <main className="login-page admin-login-page">

        <h1>
          🔐 Admin Login
        </h1>

        <p>
          Login to manage courses,
          students and reports.
        </p>


        <form
          onSubmit={handleAdminLogin}
        >

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


          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Admin Login"}
          </button>

        </form>


        <p>
          Student?{" "}

          <button
            type="button"
            onClick={() =>
              navigate("/student-login")
            }
          >
            Student Login
          </button>
        </p>

      </main>

      <Footer />

    </>

  );
}


export default AdminLogin;