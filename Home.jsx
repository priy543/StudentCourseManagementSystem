import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <Navbar />

      <main className="home">

        <h1>Welcome to Student Course Management System</h1>

        <p>
          Manage courses, enrollment and learning progress
          in one place.
        </p>

        <div className="home-buttons">

          <Link to="/login">
            <button>Login</button>
          </Link>

          <Link to="/register">
            <button>Register</button>
          </Link>

          <Link to="/courses">
            <button>Browse Courses</button>
          </Link>

        </div>

      </main>

      <Footer />
    </>
  );
}

export default Home;