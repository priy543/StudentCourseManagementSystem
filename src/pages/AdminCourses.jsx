import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  isAdminLoggedIn,
  logoutAdmin
} from "../modules/auth";

import {
  showError,
  showSuccess
} from "../modules/ui";

import { useCourses } from "../context/CourseContext";

function getDurationInDays(duration) {
  const match = String(duration || "").match(
    /(\d+(?:\.\d+)?)\s*(day|week|month|year)s?/i
  );

  if (!match) {
    return null;
  }

  const unitInDays = {
    day: 1,
    week: 7,
    month: 30,
    year: 365
  };

  return Number(match[1]) * unitInDays[match[2].toLowerCase()];
}

function getCourseModuleTitle(module) {
  return typeof module === "string"
    ? module
    : module?.title || module?.name || "";
}


function AdminCourses() {

  const navigate = useNavigate();

  const {
    courses,
    loading,
    error,
    fetchCourses,
    addCourse,
    updateCourse,
    deleteCourse
  } = useCourses();


  // =====================================================
  // STATE
  // =====================================================

  const [showForm, setShowForm] = useState(false);

  const [editingCourse, setEditingCourse] =
    useState(null);

  const [validationErrors, setValidationErrors] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [levelFilter, setLevelFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [sortBy, setSortBy] =
    useState("name-asc");

  const [formData, setFormData] = useState({

    courseName: "",
    courseCode: "",
    instructor: "",
    duration: "",
    level: "Beginner",
    category: "",
    image: "",
    status: "Active",
    overview: "",
    learningOutcomes: "",
    modules: ""

  });


  // =====================================================
  // ADMIN PROTECTION
  // =====================================================

  useEffect(() => {

    if (!isAdminLoggedIn()) {

      showError("Please login as admin first.");

      navigate("/admin-login");

    }

  }, [navigate]);


  // =====================================================
  // FORM CHANGE
  // =====================================================

  function handleChange(event) {

    const {
      name,
      value
    } = event.target;


    setFormData((previousData) => ({

      ...previousData,

      [name]: value

    }));

    setValidationErrors([]);

  }


  // =====================================================
  // RESET FORM
  // =====================================================

  function resetForm() {

    setFormData({

      courseName: "",
      courseCode: "",
      instructor: "",
      duration: "",
      level: "Beginner",
      category: "",
      image: "",
      status: "Active",
      overview: "",
      learningOutcomes: "",
      modules: ""

    });


    setEditingCourse(null);

    setValidationErrors([]);

    setShowForm(false);

  }


  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  function handleAddCourse() {

    resetForm();

    setShowForm(true);

  }


  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  function handleEditCourse(course) {

    setEditingCourse(course);

    setValidationErrors([]);


    setFormData({

      courseName:
        course.courseName || "",

      courseCode:
        course.courseCode || "",

      instructor:
        course.instructor || "",

      duration:
        course.duration || "",

      level:
        course.level || "Beginner",

      category:
        course.category || "",

      image:
        course.image || "",

      status:
        course.status || "Active",

      overview:
        course.overview || "",

      learningOutcomes:
        Array.isArray(course.learningOutcomes)
          ? course.learningOutcomes.join("\n")
          : "",

      modules:
        Array.isArray(course.modules)
          ? course.modules.map(getCourseModuleTitle).join("\n")
          : ""

    });


    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }


  // =====================================================
  // SUBMIT FORM
  // =====================================================

  async function handleSubmit(event) {

    event.preventDefault();


    const errors = [];
    const requiredFields = [
      ["Course name", formData.courseName],
      ["Course code", formData.courseCode],
      ["Instructor", formData.instructor],
      ["Duration", formData.duration],
      ["Category", formData.category],
      ["Course overview", formData.overview]
    ];

    requiredFields.forEach(([label, value]) => {
      if (!value.trim()) {
        errors.push(`${label} is required.`);
      }
    });

    if (!["Beginner", "Intermediate", "Advanced"].includes(formData.level)) {
      errors.push("Select a valid course level.");
    }

    if (!["Active", "Inactive"].includes(formData.status)) {
      errors.push("Select a valid course status.");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);


    // Convert text areas into arrays

    const courseData = {

      courseName:
        formData.courseName.trim(),

      courseCode:
        formData.courseCode.trim(),

      instructor:
        formData.instructor.trim(),

      duration:
        formData.duration.trim(),

      level:
        formData.level,

      category:
        formData.category.trim(),

      image:
        formData.image.trim() ||
        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",

      status:
        formData.status,

      overview:
        formData.overview.trim(),

      learningOutcomes:
        formData.learningOutcomes
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),

      modules:
        formData.modules
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
          .map((title) => {
            const existingModule = editingCourse?.modules?.find(
              (module) => getCourseModuleTitle(module) === title
            );

            return existingModule && typeof existingModule === "object"
              ? { ...existingModule, title }
              : title;
          })

    };


    try {

      // EDIT COURSE

      if (editingCourse) {

        await updateCourse(
          editingCourse.id,
          courseData
        );


        showSuccess(
          "Course updated successfully."
        );

      }

      // ADD COURSE

      else {

        await addCourse(courseData);


        showSuccess(
          "Course added successfully."
        );

      }


      resetForm();

    }

    catch (error) {

      console.error(
        "Course operation failed:",
        error
      );


      showError(
        "Unable to save the course. Please check that the API server is running."
      );

    }

  }


  // =====================================================
  // DELETE COURSE
  // =====================================================

  async function handleDeleteCourse(course) {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${course.courseName}"?`
      );


    if (!confirmed) {

      return;

    }


    try {

      await deleteCourse(course.id);


      showSuccess(
        "Course deleted successfully."
      );

    }

    catch (error) {

      console.error(
        "Course deletion failed:",
        error
      );


      showError(
        "Unable to delete the course."
      );

    }

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {

    logoutAdmin();

    showSuccess(
      "Admin logged out successfully."
    );

    navigate("/admin-login");

  }

  const categories = useMemo(
    () =>
      [...new Set(
        courses
          .map((course) => course.category?.trim())
          .filter(Boolean)
      )].sort((first, second) => first.localeCompare(second)),
    [courses]
  );

  const levels = useMemo(
    () =>
      [...new Set(
        courses
          .map((course) => course.level?.trim())
          .filter(Boolean)
      )].sort((first, second) => first.localeCompare(second)),
    [courses]
  );

  const statuses = useMemo(
    () =>
      [...new Set([
        "Active",
        "Inactive",
        ...courses
          .map((course) => course.status?.trim())
          .filter(Boolean)
      ])].sort((first, second) => first.localeCompare(second)),
    [courses]
  );

  const activeCourses = courses.filter(
    (course) => course.status === "Active"
  ).length;

  const inactiveCourses = courses.filter(
    (course) => course.status === "Inactive"
  ).length;

  const beginnerCourses = courses.filter(
    (course) => course.level?.toLowerCase() === "beginner"
  ).length;

  const intermediateCourses = courses.filter(
    (course) => course.level?.toLowerCase() === "intermediate"
  ).length;

  const advancedCourses = courses.filter(
    (course) => course.level?.toLowerCase() === "advanced"
  ).length;

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchingCourses = courses.filter((course) => {
      const searchableFields = [
        course.courseName,
        course.courseCode,
        course.instructor,
        course.category
      ];
      const matchesSearch =
        !normalizedSearch ||
        searchableFields.some((field) =>
          String(field || "").toLowerCase().includes(normalizedSearch)
        );

      return (
        matchesSearch &&
        (categoryFilter === "all" || course.category === categoryFilter) &&
        (levelFilter === "all" || course.level === levelFilter) &&
        (statusFilter === "all" || course.status === statusFilter)
      );
    });

    return matchingCourses.sort((first, second) => {
      if (sortBy === "name-asc" || sortBy === "name-desc") {
        const comparison = String(first.courseName || "").localeCompare(
          String(second.courseName || ""),
          undefined,
          { sensitivity: "base" }
        );

        return sortBy === "name-asc" ? comparison : -comparison;
      }

      const firstDuration = getDurationInDays(first.duration);
      const secondDuration = getDurationInDays(second.duration);

      if (firstDuration === null || secondDuration === null) {
        if (firstDuration === secondDuration) {
          return 0;
        }

        return firstDuration === null ? 1 : -1;
      }

      const comparison = firstDuration - secondDuration;

      return sortBy === "duration-asc" ? comparison : -comparison;
    });
  }, [courses, searchTerm, categoryFilter, levelFilter, statusFilter, sortBy]);

  function clearFilters() {
    setSearchTerm("");
    setCategoryFilter("all");
    setLevelFilter("all");
    setStatusFilter("all");
    setSortBy("name-asc");
  }

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    categoryFilter !== "all" ||
    levelFilter !== "all" ||
    statusFilter !== "all" ||
    sortBy !== "name-asc"
  );


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="admin-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="admin-header">

        <div>

          <span className="admin-page-label">
            ADMINISTRATION PANEL
          </span>


          <h1>
            Course Management
          </h1>


          <p>
            Add, edit and manage courses using
            the central course database.
          </p>

        </div>


        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </header>


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="admin-navigation">

        <Link to="/admin-dashboard">
          Dashboard
        </Link>


        <Link
          to="/admin-courses"
          className="active"
        >
          Courses
        </Link>


        <Link to="/admin-students">
          Students
        </Link>


        <Link to="/admin-reports">
          Reports
        </Link>

      </nav>


      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="admin-content">


        {/* =================================================
            PAGE TITLE
        ================================================= */}

        <div className="admin-section-header">

          <div>

            <span className="section-mini-label">
              COURSE DATABASE
            </span>


            <h2>
              Courses
            </h2>


            <p>
              Total Courses:{" "}
              <strong>
                {courses.length}
              </strong>
            </p>

          </div>


          <button
            type="button"
            className="primary-btn"
            onClick={handleAddCourse}
          >
            + Add New Course
          </button>

        </div>

        <section className="admin-course-stats" aria-label="Course statistics">
          {[
            ["Total Courses", courses.length],
            ["Active Courses", activeCourses],
            ["Inactive Courses", inactiveCourses],
            ["Beginner Courses", beginnerCourses],
            ["Intermediate Courses", intermediateCourses],
            ["Advanced Courses", advancedCourses]
          ].map(([label, value]) => (
            <article className="admin-course-stat" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </section>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div className="course-message">

            <div className="message-icon">
              📚
            </div>

            <h3>
              Loading courses...
            </h3>

            <p>
              Please wait while courses
              are loaded.
            </p>

          </div>

        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="course-message error-message">

            <div className="message-icon">
              ⚠️
            </div>

            <h3>
              Unable to Load Courses
            </h3>

            <p>
              {error}
            </p>

            <button
              type="button"
              className="primary-btn"
              onClick={fetchCourses}
            >
              Retry
            </button>

          </div>

        )}


        {/* =================================================
            ADD / EDIT FORM
        ================================================= */}

        {showForm && (

          <section className="admin-form-card">


            {/* FORM HEADER */}

            <div className="form-card-header">

              <div>

                <span className="form-label">
                  {editingCourse
                    ? "UPDATE COURSE"
                    : "NEW COURSE"}
                </span>


                <h2>

                  {editingCourse
                    ? "Edit Course"
                    : "Add New Course"}

                </h2>


                <p>
                  Enter the course information
                  below.
                </p>

              </div>


              <button
                type="button"
                className="secondary-btn"
                onClick={resetForm}
              >
                ✕ Close
              </button>

            </div>

            {validationErrors.length > 0 && (
              <div className="admin-form-validation" role="alert">
                <strong>Review these required fields:</strong>
                <ul>
                  {validationErrors.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            )}


            {/* FORM */}

            <form
              noValidate
              onSubmit={handleSubmit}
            >

              <div className="form-grid">


                {/* COURSE NAME */}

                <div className="form-group">

                  <label>
                    Course Name *
                  </label>


                  <input
                    type="text"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleChange}
                    placeholder="Python Programming"
                    required
                  />

                </div>


                {/* COURSE CODE */}

                <div className="form-group">

                  <label>
                    Course Code *
                  </label>


                  <input
                    type="text"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={handleChange}
                    placeholder="CS101"
                    required
                  />

                </div>


                {/* INSTRUCTOR */}

                <div className="form-group">

                  <label>
                    Instructor *
                  </label>


                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleChange}
                    placeholder="Dr. Anu"
                    required
                  />

                </div>


                {/* DURATION */}

                <div className="form-group">

                  <label>
                    Duration *
                  </label>


                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="8 Weeks"
                    required
                  />

                </div>


                {/* LEVEL */}

                <div className="form-group">

                  <label>
                    Level
                  </label>


                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    required
                  >

                    <option value="Beginner">
                      Beginner
                    </option>

                    <option value="Intermediate">
                      Intermediate
                    </option>

                    <option value="Advanced">
                      Advanced
                    </option>

                  </select>

                </div>


                {/* CATEGORY */}

                <div className="form-group">

                  <label>
                    Category *
                  </label>


                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Programming"
                    required
                  />

                </div>


                {/* STATUS */}

                <div className="form-group">

                  <label>
                    Status
                  </label>


                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >

                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                  </select>

                </div>


                {/* IMAGE */}

                <div className="form-group">

                  <label>
                    Course Image URL
                  </label>


                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/course-image.jpg"
                  />

                </div>


                {/* OVERVIEW */}

                <div className="form-group full-width">

                  <label>
                    Course Overview *
                  </label>


                  <textarea
                    name="overview"
                    value={formData.overview}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe what students will learn in this course..."
                    required
                  />

                </div>


                {/* LEARNING OUTCOMES */}

                <div className="form-group">

                  <label>
                    Learning Outcomes
                  </label>


                  <textarea
                    name="learningOutcomes"
                    value={formData.learningOutcomes}
                    onChange={handleChange}
                    rows="7"
                    placeholder={
`Understand Python basics
Work with functions
Use object-oriented programming
Build Python applications`
                    }
                  />


                  <small>
                    Enter one outcome per line.
                  </small>

                </div>


                {/* MODULES */}

                <div className="form-group">

                  <label>
                    Course Modules
                  </label>


                  <textarea
                    name="modules"
                    value={formData.modules}
                    onChange={handleChange}
                    rows="7"
                    placeholder={
`Python Basics
Control Statements
Functions
OOP
Mini Project`
                    }
                  />


                  <small>
                    Enter one module per line.
                  </small>

                </div>

              </div>


              {/* FORM ACTIONS */}

              <div className="form-actions">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="primary-btn"
                >

                  {editingCourse
                    ? "✓ Update Course"
                    : "+ Add Course"}

                </button>

              </div>

            </form>

          </section>

        )}


        {!loading && !error && courses.length > 0 && (
          <section className="admin-course-discovery" aria-label="Search and filter courses">
            <label className="admin-course-search">
              <span>Search courses</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Name, code, instructor, or category"
              />
            </label>

            <label>
              <span>Category</span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Level</span>
              <select
                value={levelFilter}
                onChange={(event) => setLevelFilter(event.target.value)}
              >
                <option value="all">All Levels</option>
                {levels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="name-asc">Course Name: A → Z</option>
                <option value="name-desc">Course Name: Z → A</option>
                <option value="duration-asc">Duration: Shortest → Longest</option>
                <option value="duration-desc">Duration: Longest → Shortest</option>
              </select>
            </label>
          </section>
        )}

        {!loading && !error && courses.length > 0 && (
          <div className="admin-course-results" aria-live="polite">
            <p>
              Showing <strong>{filteredCourses.length}</strong> of{" "}
              <strong>{courses.length}</strong> courses
            </p>
            {hasActiveFilters && (
              <button type="button" className="admin-clear-filters" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        )}


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!loading &&
          !error &&
          courses.length === 0 && (

            <div className="course-message">

              <div className="message-icon">
                📚
              </div>

              <h3>
                No Courses Available
              </h3>

              <p>
                Add your first course to the
                course database.
              </p>


              <button
                type="button"
                className="primary-btn empty-add-btn"
                onClick={handleAddCourse}
              >
                + Add First Course
              </button>

            </div>

          )}


        {/* =================================================
            COURSE LIST
        ================================================= */}

        {!loading &&
          !error &&
          courses.length > 0 &&
          filteredCourses.length === 0 && (
            <div className="course-message admin-no-matches">
              <div className="message-icon">⌕</div>
              <h3>No courses match these filters</h3>
              <p>Adjust your search or clear the selected filters.</p>
              <button type="button" className="primary-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          filteredCourses.length > 0 && (

            <section className="admin-course-grid">


              {filteredCourses.map((course) => (

                <article
                  className="admin-course-card"
                  key={course.id}
                >


                  {/* COURSE IMAGE */}

                  <div className="admin-course-image">

                    <img
                      src={
                        course.image ||
                        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                      }
                      alt={course.courseName}
                      onError={(event) => {
                        event.currentTarget.src =
                          "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                      }}
                    />

                  </div>


                  {/* COURSE CONTENT */}

                  <div className="admin-course-content">


                    {/* CODE + STATUS */}

                    <div className="course-status-row">

                      <span className="course-code">
                        {course.courseCode}
                      </span>


                      <span
                        className={
                          course.status === "Active"
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {course.status}
                      </span>

                    </div>


                    {/* NAME */}

                    <h3>
                      {course.courseName}
                    </h3>


                    {/* OVERVIEW */}

                    <p className="course-overview">

                      {course.overview}

                    </p>


                    {/* DETAILS */}

                    <div className="course-details">

                      <p>
                        👨‍🏫{" "}
                        <strong>
                          Instructor:
                        </strong>{" "}
                        {course.instructor}
                      </p>


                      <p>
                        ⏱️{" "}
                        <strong>
                          Duration:
                        </strong>{" "}
                        {course.duration}
                      </p>


                      <p>
                        🎯{" "}
                        <strong>
                          Level:
                        </strong>{" "}
                        {course.level}
                      </p>


                      <p>
                        📂{" "}
                        <strong>
                          Category:
                        </strong>{" "}
                        {course.category}
                      </p>

                    </div>


                    {/* LEARNING INFO */}

                    <div className="course-extra-info">

                      <span>
                        📖{" "}
                        {Array.isArray(course.modules)
                          ? course.modules.length
                          : 0}{" "}
                        Modules
                      </span>


                      <span>
                        🎯{" "}
                        {Array.isArray(
                          course.learningOutcomes
                        )
                          ? course.learningOutcomes.length
                          : 0}{" "}
                        Outcomes
                      </span>

                    </div>


                    {/* ACTIONS */}

                    <div className="course-actions">

                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() =>
                          handleEditCourse(course)
                        }
                      >
                        ✏️ Edit
                      </button>


                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() =>
                          handleDeleteCourse(course)
                        }
                      >
                        🗑️ Delete
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </section>

          )}

      </main>

    </div>

  );

}


export default AdminCourses;