import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";

import {
  registerStudent
} from "../modules/auth";

import {
  validateRegistration
} from "../modules/validation";

import {
  showSuccess,
  showError
} from "../modules/ui";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      department: "",
      course: ""
    });

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]:
        event.target.value
    });
  }

  function handleRegister(event) {
    event.preventDefault();

    const errors =
      validateRegistration(
        formData
      );

    if (Object.keys(errors).length) {
      showError(
        Object.values(errors)[0]
      );
      return;
    }

    const result =
      registerStudent(formData);

    if (!result.success) {
      showError(result.message);
      return;
    }

    showSuccess(
      "Registration Successful!"
    );

    navigate("/login");
  }

  return (
    <>
      <Navbar />

      <main className="register-page">

        <h1>Student Registration</h1>

        <form
          onSubmit={handleRegister}
        >

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <br />
          <br />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <br />
          <br />

          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <br />
          <br />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={
              formData.confirmPassword
            }
            onChange={handleChange}
            required
          />

          <br />
          <br />

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            required
          />

          <br />
          <br />

          <select
            name="course"
            value={formData.course}
            onChange={handleChange}
            required
          >

            <option value="">
              Select Course Interest
            </option>

            <option value="Python Programming">
              Python Programming
            </option>

            <option value="Web Development">
              Web Development
            </option>

            <option value="Artificial Intelligence">
              Artificial Intelligence
            </option>

          </select>

          <br />
          <br />

          <button type="submit">
            Create Account
          </button>

        </form>

        <p>
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

      </main>

      <Footer />
    </>
  );
}

export default Register;