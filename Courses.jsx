import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";

function Courses() {

  const [courses, setCourses] = useState([]);

  useEffect(() => {

    // Courses added by Admin
    const adminCourses =
      JSON.parse(
        localStorage.getItem("adminCourses")
      ) || [];

    // Default courses
    const defaultCourses = [
      {
        id: 1,
        name: "Python Programming",
        instructor: "John Smith",
        duration: "3 Months",
        description:
          "Learn Python from basic to advanced concepts, including programming and problem solving."
      },
      {
        id: 2,
        name: "Web Development",
        instructor: "David Kumar",
        duration: "4 Months",
        description:
          "Learn HTML, CSS, JavaScript and React to build modern web applications."
      },
      {
        id: 3,
        name: "Artificial Intelligence",
        instructor: "Priya Sharma",
        duration: "6 Months",
        description:
          "Learn machine learning, artificial intelligence and intelligent application development."
      }
    ];


    // Combine default + admin courses
    const allCourses = [
      ...defaultCourses,
      ...adminCourses
    ];

    setCourses(allCourses);

  }, []);


  return (
    <>
      <Navbar />

      <main className="courses-page">

        <h1>Available Courses</h1>

        <p>
          Explore our courses and start your learning journey.
        </p>


        <div className="courses-container">

          {courses.length === 0 ? (

            <p>
              No courses available.
            </p>

          ) : (

            courses.map((course) => (

              <CourseCard
                key={course.id}
                course={course}
              />

            ))

          )}

        </div>

      </main>

      <Footer />
    </>
  );
}

export default Courses;