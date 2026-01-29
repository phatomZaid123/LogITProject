import { useEffect, useState } from "react";
import Button from "./ui/Button";
import { Link } from "react-router-dom";

function StudentList({
  selectedBatchId = "",
  selectedCourse = "",
  students = [],
  loading = false,
}) {
  const [filteredStudents, setFilteredStudents] = useState([]);

  // Filter students based on selected batch and course
  useEffect(() => {
    let filtered = [...students];

    if (selectedBatchId) {
      // Use student_batch_id for filtering (comes from backend)
      filtered = filtered.filter((student) => {
        const batchId =
          student.student_batch_id ||
          student.student_batch?._id ||
          student.student_batch;
        return batchId === selectedBatchId;
      });
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
    <div className="w-full bg-linear-to-b from-gray-50 to-white rounded-lg px-0 py-0 text-gray-900">
      {loading ? (
        <div className="text-center py-12 flex-1 flex items-center justify-center">
          <div className="text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
            Loading students...
          </div>
        </div>
      ) : displayStudents.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-lg font-medium mb-2">No students found</div>
          <p className="text-sm">
            Try adjusting your filters or add new students
          </p>
        </div>
      ) : (
        <div className="mx-auto w-full overflow-x-auto shadow-sm rounded-lg border border-gray-200 text-gray-900">
          <table className="w-full text-sm text-left bg-white">
            <thead className="text-xs font-semibold text-gray-700 uppercase bg-gray-100 border-b-2 border-gray-300 sticky top-0">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 font-semibold text-gray-800"
                >
                  Student Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 font-semibold text-gray-800"
                >
                  Admission No.
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 font-semibold text-gray-800"
                >
                  Course
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 font-semibold text-gray-800"
                >
                  Batch
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 font-semibold text-gray-800"
                >
                  Company
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700 divide-y divide-gray-200">
              {displayStudents.map((student) => (
                <tr
                  key={student._id}
                  className="hover:bg-purple-50 transition-colors duration-150 border-l-4 border-l-transparent hover:border-l-purple-600"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {student.name}
                  </td>
                  <td className="text-gray-700 px-6 py-4 whitespace-nowrap font-mono text-sm">
                    {student.student_admission_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {student.student_course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1.5 bg-linear-to-r from-blue-100 to-blue-50 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
                      {student.student_batch_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-indigo-600 whitespace-nowrap">
                    {student.assigned_company}
                  </td>
                  <td>
                    <Button variant="outline">
                      <Link
                        to={`/dean/dashboard/studentprofile/${student._id}`}
                      >
                        View details
                      </Link>
                    </Button>
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
