import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";

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

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  }

  function handleRegister(event) {
    event.preventDefault();

    if (formData.password.length < 8) {
      alert("Password must contain at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const student = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      department: formData.department,
      course: formData.course
    };

    localStorage.setItem(
      "student",
      JSON.stringify(student)
    );

    alert("Registration Successful!");

    navigate("/login");
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

          <br /><br />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <br /><br />

          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <br /><br />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <br /><br />

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
            required
          />

          <br /><br />

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

          <br /><br />

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