import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

import api from "../services/api";

const CourseContext = createContext(null);

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

      setCourses(response.data);

      setError(null);
    } catch (error) {
      console.error(
        "Failed to fetch courses:",
        error
      );

      setError(
        "Unable to load courses. Please make sure the API server is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

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

      setCourses((previousCourses) => [
        ...previousCourses,
        response.data
      ]);

      return response.data;
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

      setCourses((previousCourses) =>
        previousCourses.map((course) =>
          String(course.id) === String(id)
            ? response.data
            : course
        )
      );

      return response.data;
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