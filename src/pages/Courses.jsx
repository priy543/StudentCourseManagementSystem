import { useMemo, useState } from "react";

import { useCourses } from "../context/CourseContext";
import CourseCard from "../components/CourseCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function getCourseDurationValue(duration) {
  const match =
    String(duration || "").match(
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

function Courses() {
  const {
    courses,
    loading,
    error,
    fetchCourses
  } = useCourses();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");

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

  const matchingCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredCourses = courses.filter((course) => {
      const searchableFields = [
        course.courseName || course.name,
        course.courseCode,
        course.instructor,
        course.category
      ];

      const matchesSearch =
        !normalizedSearch ||
        searchableFields.some((field) =>
          String(field || "").toLowerCase().includes(normalizedSearch)
        );
      const matchesCategory =
        categoryFilter === "all" ||
        course.category === categoryFilter;
      const matchesLevel =
        levelFilter === "all" ||
        course.level === levelFilter;

      return matchesSearch && matchesCategory && matchesLevel;
    });

    return filteredCourses.sort((first, second) => {
      if (sortBy === "name-asc" || sortBy === "name-desc") {
        const nameComparison = String(
          first.courseName || first.name || ""
        ).localeCompare(
          String(second.courseName || second.name || ""),
          undefined,
          { sensitivity: "base" }
        );

        return sortBy === "name-asc"
          ? nameComparison
          : -nameComparison;
      }

      const firstDuration = getCourseDurationValue(first.duration);
      const secondDuration = getCourseDurationValue(second.duration);

      if (firstDuration === null || secondDuration === null) {
        if (firstDuration === secondDuration) {
          return 0;
        }

        return firstDuration === null ? 1 : -1;
      }

      const durationComparison = firstDuration - secondDuration;

      return sortBy === "duration-asc"
        ? durationComparison
        : -durationComparison;
    });
  }, [courses, searchTerm, categoryFilter, levelFilter, sortBy]);

  function clearFilters() {
    setSearchTerm("");
    setCategoryFilter("all");
    setLevelFilter("all");
    setSortBy("name-asc");
  }

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    categoryFilter !== "all" ||
    levelFilter !== "all" ||
    sortBy !== "name-asc"
  );

  return (
    <>
      <Navbar />

      <main className="courses-page">

        {/* PAGE HEADER */}
        <section className="courses-header">

          <span className="section-badge">
            📚 Learning Platform
          </span>

          <h1>Explore Our Courses</h1>

          <p>
            Choose a course, build your skills,
            and track your learning progress.
          </p>

        </section>

        {/* LOADING */}
        {loading && (
          <div className="course-message">
            <h3>Loading courses...</h3>

            <p>
              Please wait while we load the
              available courses.
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="course-message error-message">

            <h3>Unable to Load Courses</h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={fetchCourses}
            >
              Try Again
            </button>

          </div>
        )}

        {/* NO COURSES */}
        {!loading &&
          !error &&
          courses.length === 0 && (

            <div className="course-message">

              <h3>No Courses Available</h3>

              <p>
                There are currently no courses
                available.
              </p>

            </div>
          )}

        {!loading &&
          !error &&
          courses.length > 0 && (
            <>
              <section
                className="course-discovery-controls"
                aria-label="Search and filter courses"
              >
                <label className="course-search-field">
                  <span>Search courses</span>
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Name, code, instructor, or category"
                  />
                </label>

                <label className="course-filter-field">
                  <span>Category</span>
                  <select
                    value={categoryFilter}
                    onChange={(event) =>
                      setCategoryFilter(event.target.value)
                    }
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="course-filter-field">
                  <span>Level</span>
                  <select
                    value={levelFilter}
                    onChange={(event) =>
                      setLevelFilter(event.target.value)
                    }
                  >
                    <option value="all">All Levels</option>
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="course-filter-field">
                  <span>Sort by</span>
                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value)
                    }
                  >
                    <option value="name-asc">Course Name: A → Z</option>
                    <option value="name-desc">Course Name: Z → A</option>
                    <option value="duration-asc">
                      Duration: Shortest → Longest
                    </option>
                    <option value="duration-desc">
                      Duration: Longest → Shortest
                    </option>
                  </select>
                </label>
              </section>

              <div className="course-results-summary" aria-live="polite">
                <p>
                  Showing <strong>{matchingCourses.length}</strong>{" "}
                  {matchingCourses.length === 1 ? "course" : "courses"}
                </p>
                {hasActiveFilters && (
                  <button type="button" onClick={clearFilters}>
                    Clear Filters
                  </button>
                )}
              </div>

              {matchingCourses.length === 0 ? (
                <section className="course-empty-state" role="status">
                  <span className="course-empty-icon" aria-hidden="true">
                   ⌕
                  </span>
                  <h2>No matching courses</h2>
                  <p>
                    Try a different search or clear your filters to see all
                    available courses.
                  </p>
                  <button type="button" onClick={clearFilters}>
                    Clear Filters
                  </button>
                </section>
              ) : (
                <section className="course-grid">
                  {matchingCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={{
                        ...course,
                        name: course.courseName,
                        description: course.overview
                      }}
                    />
                  ))}
                </section>
              )}
            </>
          )}

      </main>

      <Footer />
    </>
  );
}

export default Courses;