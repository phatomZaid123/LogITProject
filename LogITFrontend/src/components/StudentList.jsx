import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function StudentList({ selectedBatchId = "", selectedCourse = "" }) {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { api } = useAuth();
  console.log(students);
  // Fetch all students initially
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await api.get("/dean/students");
        setStudents(response.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Filter students based on selected batch and course
  useEffect(() => {
    let filtered = [...students];

    if (selectedBatchId) {
      filtered = filtered.filter(
        (student) => student.student_batch_id === selectedBatchId,
      );
    }

    if (selectedCourse) {
      filtered = filtered.filter(
        (student) => student.student_course === selectedCourse,
      );
    }

    setFilteredStudents(filtered);
  }, [selectedBatchId, selectedCourse, students]);

  const displayStudents =
    filteredStudents.length > 0 ? filteredStudents : students;
  
  return (
    <div className="w-full bg-gray-200 rounded-2xl px-2 py-4 text-purple-800">
      <h1 className="text-2xl text-center font-serif lg:text-4xl mb-6">
        Enrolled Students{" "}
        {displayStudents.length > 0 && `(${displayStudents.length})`}
      </h1>

      {loading ? (
        <div className="text-center py-8">Loading students...</div>
      ) : displayStudents.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No students found matching your filters.
        </div>
      ) : (
        <div className="mx-auto max-w-6xl overflow-x-auto shadow-md rounded-lg border border-gray-200 text-purple-800">
          <table className="w-full text-sm text-left text-purple-800 bg-white">
            <thead className="text-sm text-purple-800 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Student Name
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Admission No.
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Course
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Batch
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Company
                </th>
              </tr>
            </thead>
            <tbody className="text-purple-800 divide-y divide-gray-200">
              {displayStudents.map((student) => (
                <tr
                  key={student._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-purple-800 whitespace-nowrap">
                    {student.name}
                  </td>
                  <td className="text-purple-800 px-6 py-4 whitespace-nowrap">
                    {student.student_admission_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.student_course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {student.student_batch_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-indigo-600 whitespace-nowrap">
                    {student.company || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StudentList;
