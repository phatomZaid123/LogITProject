import { useEffect, useState } from "react";
import { Menu, X, LogOut, Shield } from "lucide-react";
import Button from "./ui/Button";
import { useAuth } from "../context/AuthContext";

function SideBar({
  children,
  setCreateBatch,
  setCreateStudent,
  batches,
  selectedBatchId,
  setSelectedBatchId,
  selectedCourse,
  setSelectedCourse,
}) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const { logout, api } = useAuth();
  const [courses, setCourses] = useState([]);

  // List of available courses
  useEffect(() => {
    //Fetch student courses from backend
    const fetchStudentCourses = async () => {
      try {
        const response = await api.get("/dean/students");
        const students = response.data;
        const coursesSet = new Set(
          students.map((student) => student.student_course)
        );
        setCourses(Array.from(coursesSet));
      } catch (error) {
        console.error("Error fetching student courses:", error);
      }
    };

    fetchStudentCourses();
  }, []);

  return (
    <div className="flex min-h-screen">
      <button
        className="fixed top-4 left-1 z-50 p-1 bg-purple-600 text-white rounded-md lg:hidden"
        onClick={() => setOpenSidebar(!openSidebar)}
      >
        {openSidebar ? <X size={24} /> : <Menu size={24} />}
      </button>

      {openSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpenSidebar(false)}
        />
      )}

      <aside
        className={`rounded-2xl fixed top-0 left-0 z-40 h-screen w-60 bg-purple-700 text-white transition-transform duration-300 ease-in-out
          ${openSidebar ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:sticky`}
      >
        <div className="flex flex-col h-full p-3 ">
          <div className="bg-purple-900 font-bold flex flex-col items-center justify-center py-4 rounded-3xl mb-6">
            <div className="text-center text-lg">Dean Dashboard</div>
            <Shield size={60} className="my-2" />
            <div className="text-2xl text-center">CSC</div>
          </div>

          {/* Batch Filter Dropdown */}
          <select
            className="mb-4 p-2 border border-white rounded-lg text-white"
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
          >
            <option value="">All Batches</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.session_name}
              </option>
            ))}
          </select>

          {/* Course Filter Dropdown */}
          <select
            className="mb-4 p-2 border border-white rounded-lg text-white"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            className="mt-2 text-white"
            size="sm"
            onClick={() => setCreateBatch(true)}
          >
            Create Batch
          </Button>
          <Button
            variant="outline"
            className="mt-2 text-white"
            size="sm"
            onClick={() => setCreateStudent(true)}
          >
            Create Student
          </Button>
          <Button onClick={logout} variant="danger" className="mt-40">
            <LogOut size={25} />
            <span className="ml-2"> Logout </span>
          </Button>
        </div>
      </aside>

      <main className="flex-1 px-4 w-full lg:pt-2">{children}</main>
    </div>
  );
}

export default SideBar;
