import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function AdminCourses() {

  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    instructor: "",
    duration: "",
    description: ""
  });

  const [editId, setEditId] = useState(null);


  // Check admin login and load courses
  useEffect(() => {

    const adminLoggedIn =
      localStorage.getItem("adminLoggedIn");

    if (adminLoggedIn !== "true") {

      alert("Please login as Admin");

      navigate("/admin-login");

      return;
    }

    const savedCourses =
      JSON.parse(
        localStorage.getItem("adminCourses")
      ) || [];

    setCourses(savedCourses);

  }, [navigate]);


  // Handle form input
  function handleChange(event) {

    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });

  }


  // Add or update course
  function handleSubmit(event) {

    event.preventDefault();

    if (editId === null) {

      // Create new course
      const newCourse = {
        id: Date.now(),
        name: formData.name,
        instructor: formData.instructor,
        duration: formData.duration,
        description: formData.description
      };

      const updatedCourses = [
        ...courses,
        newCourse
      ];

      setCourses(updatedCourses);

      localStorage.setItem(
        "adminCourses",
        JSON.stringify(updatedCourses)
      );

      alert("Course added successfully!");

    } else {

      // Update existing course
      const updatedCourses =
        courses.map((course) =>
          course.id === editId
            ? {
                ...course,
                name: formData.name,
                instructor: formData.instructor,
                duration: formData.duration,
                description: formData.description
              }
            : course
        );

      setCourses(updatedCourses);

      localStorage.setItem(
        "adminCourses",
        JSON.stringify(updatedCourses)
      );

      alert("Course updated successfully!");

      setEditId(null);
    }


    // Clear form
    setFormData({
      name: "",
      instructor: "",
      duration: "",
      description: ""
    });

  }


  // Edit course
  function handleEdit(course) {

    setEditId(course.id);

    setFormData({
      name: course.name,
      instructor: course.instructor,
      duration: course.duration,
      description: course.description
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }


  // Delete course
  function handleDelete(id) {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this course?"
      );

    if (!confirmDelete) {
      return;
    }

    const updatedCourses =
      courses.filter(
        (course) => course.id !== id
      );

    setCourses(updatedCourses);

    localStorage.setItem(
      "adminCourses",
      JSON.stringify(updatedCourses)
    );

    alert("Course deleted successfully!");

  }


  // Cancel editing
  function handleCancelEdit() {

    setEditId(null);

    setFormData({
      name: "",
      instructor: "",
      duration: "",
      description: ""
    });

  }


  return (
    <>
      <Navbar />

      <main className="admin-courses-page">

        <h1>📚 Course Management</h1>

        <p>
          Add, edit and delete courses from the system.
        </p>


        {/* Add / Edit Course Form */}

        <div className="admin-form">

          <h2>
            {editId === null
              ? "➕ Add New Course"
              : "✏️ Edit Course"}
          </h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="name"
              placeholder="Course Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="instructor"
              placeholder="Instructor Name"
              value={formData.instructor}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="duration"
              placeholder="Duration (Example: 3 Months)"
              value={formData.duration}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder="Course Description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
            ></textarea>


            <button type="submit">

              {editId === null
                ? "➕ Add Course"
                : "💾 Update Course"}

            </button>


            {editId !== null && (

              <button
                type="button"
                onClick={handleCancelEdit}
              >
                ❌ Cancel
              </button>

            )}

          </form>

        </div>


        {/* Course List */}

        <div className="admin-course-list">

          <h2>📋 All Courses</h2>

          {courses.length === 0 ? (

            <div className="empty-courses">

              <p>
                No courses available.
              </p>

              <p>
                Add your first course using the form above.
              </p>

            </div>

          ) : (

            courses.map((course) => (

              <div
                className="admin-course-card"
                key={course.id}
              >

                <h3>
                  {course.name}
                </h3>

                <p>
                  <strong>Instructor:</strong>{" "}
                  {course.instructor}
                </p>

                <p>
                  <strong>Duration:</strong>{" "}
                  {course.duration}
                </p>

                <p>
                  <strong>Description:</strong>{" "}
                  {course.description}
                </p>


                <div className="course-actions">

                  <button
                    onClick={() =>
                      handleEdit(course)
                    }
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(course.id)
                    }
                  >
                    🗑️ Delete
                  </button>

                </div>

              </div>

            ))

          )}

        </div>


        {/* Back Button */}

        <button
          className="dashboard-button"
          onClick={() =>
            navigate("/admin-dashboard")
          }
        >
          ← Back to Admin Dashboard
        </button>

      </main>

      <Footer />
    </>
  );
}

export default AdminCourses;