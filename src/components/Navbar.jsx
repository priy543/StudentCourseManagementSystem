import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <h2>Student Course Management</h2>

      <div className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/student-login" end>Login</NavLink>
        <NavLink to="/student-register" end>Register</NavLink>
        <NavLink to="/dashboard" end>Dashboard</NavLink>
        <NavLink to="/profile" end>Profile</NavLink>
        <NavLink to="/courses" end>Courses</NavLink>
      </div>

    </nav>
  );
}

export default Navbar;