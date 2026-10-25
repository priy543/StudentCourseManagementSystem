
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

import {
  validateRegistration
} from "../modules/validation";

import {
  showSuccess,
  showError
} from "../modules/ui";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    course: ""
  });

  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  }

  async function handleRegister(event) {
    event.preventDefault();

    const errors = validateRegistration(formData);

    if (Object.keys(errors).length) {
      showError(Object.values(errors)[0]);
      return;
    }

    try {
      setLoading(true);

      const {
        confirmPassword,
        ...studentData
      } = formData;

      const response = await api.post("/auth/register", {
        ...studentData,
        name: studentData.name.trim(),
        email: studentData.email.trim().toLowerCase(),
        department: studentData.department.trim()
      });

      showSuccess(
        response.data.message || "Registration successful!"
      );

      navigate("/student-login");
    } catch (error) {
      showError(
        error.response?.data?.message ||
        "Registration failed. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="register-page">
        <h1>Student Registration</h1>

        <form onSubmit={handleRegister}>
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
            value={formData.confirmPassword}
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
            <option value="">Select Course Interest</option>
            <option value="Python Programming">
              Python Programming
            </option>
            <option value="Web Development">
              Web Development
            </option>
            <option value="Artificial Intelligence">
              Artificial Intelligence
            </option>
            <option value="Data Analytics">
              Data Analytics
            </option>
          </select>

          <br />
          <br />

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p>
          Already have an account?{" "}
          <Link to="/student-login">Login</Link>
        </p>
      </main>

      <Footer />
    </>
  );
}

export default Register;
