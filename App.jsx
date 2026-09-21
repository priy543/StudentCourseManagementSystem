import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Learning from "./pages/Learning";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCourses from "./pages/AdminCourses";
import AdminStudents from "./pages/AdminStudents";
import AdminReports from "./pages/AdminReports";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* Student */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/courses"
          element={<Courses />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/learning/:courseId"
          element={<Learning />}
        />


        {/* Admin */}

        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin-courses"
          element={<AdminCourses />}
        />

        <Route
          path="/admin-students"
          element={<AdminStudents />}
        />

        <Route
          path="/admin-reports"
          element={<AdminReports />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;