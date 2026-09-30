import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

import {
  loginAdmin
} from "../modules/auth";

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


  function handleAdminLogin(event) {

    event.preventDefault();


    /* ==============================
       VALIDATE LOGIN
    ============================== */

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


    /* ==============================
       ADMIN LOGIN
    ============================== */

    const result =
      loginAdmin(
        email,
        password
      );


    if (!result.success) {

      showError(
        result.message
      );

      return;
    }


    /* ==============================
       SUCCESS
    ============================== */

    showSuccess(
      "Admin login successful!"
    );


    navigate(
      "/admin-dashboard"
    );
  }


  return (

    <>

      <Navbar />

      <main className="login-page">

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


          <button type="submit">
            Admin Login
          </button>

        </form>


        <p>
          Student?{" "}

          <button
            type="button"
            onClick={() =>
              navigate("/login")
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