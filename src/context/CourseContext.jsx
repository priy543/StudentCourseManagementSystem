import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

import api from "../services/api";

const CourseContext = createContext(null);

function getCourseFromResponse(response) {
  const course = response.data?.data;

  if (!course || typeof course.id !== "string") {
    throw new Error("The course API returned an invalid course response.");
  }

  return course;
}

function getCoursesFromResponse(response) {
  const courses = response.data?.data;

  if (!Array.isArray(courses)) {
    throw new Error("The course API returned an invalid course list.");
  }

  return courses;
}

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================
  // FETCH COURSES
  // ==========================================

  const fetchCourses = useCallback(async function fetchCourses() {
    try {
      setLoading(true);

      const response = await api.get("/courses");

      setCourses(getCoursesFromResponse(response));

      setError(null);
    } catch (error) {
      console.error(
        "Failed to fetch courses:",
        error
      );

      setError(
        error.response?.data?.error?.message ||
          "Unable to load courses. Please make sure the API server is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  async function getCourseById(id) {
    const response = await api.get(
      `/courses/${encodeURIComponent(id)}`
    );

    return getCourseFromResponse(response);
  }

  // ==========================================
  // LOAD COURSES WHEN APPLICATION STARTS
  // ==========================================

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // ==========================================
  // ADD COURSE
  // ==========================================

  async function addCourse(course) {
    try {
      const response = await api.post(
        "/courses",
        course
      );
      const createdCourse = getCourseFromResponse(response);

      setCourses((previousCourses) => [
        ...previousCourses,
        createdCourse
      ]);

      return createdCourse;
    } catch (error) {
      console.error(
        "Failed to add course:",
        error
      );

      throw error;
    }
  }

  // ==========================================
  // UPDATE COURSE
  // ==========================================

  async function updateCourse(
    id,
    updatedCourse
  ) {
    try {
      const response = await api.put(
        `/courses/${id}`,
        updatedCourse
      );
      const savedCourse = getCourseFromResponse(response);

      setCourses((previousCourses) =>
        previousCourses.map((course) =>
          String(course.id) === String(id)
            ? savedCourse
            : course
        )
      );

      return savedCourse;
    } catch (error) {
      console.error(
        "Failed to update course:",
        error
      );

      throw error;
    }
  }

  // ==========================================
  // DELETE COURSE
  // ==========================================

  async function deleteCourse(id) {
    try {
      await api.delete(
        `/courses/${id}`
      );

      setCourses((previousCourses) =>
        previousCourses.filter(
          (course) =>
            String(course.id) !== String(id)
        )
      );
    } catch (error) {
      console.error(
        "Failed to delete course:",
        error
      );

      throw error;
    }
  }

  // ==========================================
  // PROVIDER
  // ==========================================

  return (
    <CourseContext.Provider
      value={{
        courses,
        loading,
        error,
        fetchCourses,
        getCourseById,
        addCourse,
        updateCourse,
        deleteCourse
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

// ==========================================
// CUSTOM HOOK
// ==========================================

export function useCourses() {
  return useContext(CourseContext);
}