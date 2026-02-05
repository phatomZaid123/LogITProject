import { Link } from "react-router-dom";

function StudentList({
  selectedBatchId = "",
  selectedCourse = "",
  students = [],
  loading = false,
}) {
  // No filtering needed here - filtering is handled by API and parent component
  // Just display the students as received
  return (
    <div className="w-full bg-linear-to-b from-gray-50 to-white rounded-lg px-0 py-0 text-gray-900">
      {loading ? (
        <div className="text-center py-12 flex-1 flex items-center justify-center">
          <div className="text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
            Loading students...
          </div>
        </div>
      ) : students.length === 0 ? (
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
                <th
                  scope="col"
                  className="px-6 py-4 font-semibold text-gray-800"
                >
                  Hours Completed
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 font-semibold text-gray-800"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700 divide-y divide-gray-200">
              {students.map((student) => {
                const requiredHours = Number(student.ojt_hours_required || 500);
                const approvedHours = Number(student.ojt_hours_completed || 0);
                const remainingHours = Math.max(
                  0,
                  requiredHours - approvedHours,
                );

                return (
                  <tr
                    key={student._id}
                    className="hover:bg-purple-50 transition-colors duration-150 border-l-4 border-l-transparent hover:border-l-purple-600"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      <Link
                        to={`/dean/dashboard/studentprofile/${student._id}`}
                        className="hover:text-purple-600 transition-colors font-semibold"
                      >
                        {student.name}
                      </Link>
                    </td>

                    <td className="text-gray-700 px-6 py-4 whitespace-nowrap font-mono text-sm">
                      <Link
                        to={`/dean/dashboard/studentprofile/${student._id}`}
                        className="hover:text-purple-600 transition-colors"
                      >
                        {student.student_admission_number}
                      </Link>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      <Link
                        to={`/dean/dashboard/studentprofile/${student._id}`}
                        className="hover:text-purple-600 transition-colors"
                      >
                        {student.student_course}
                      </Link>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      <Link
                        to={`/dean/dashboard/studentprofile/${student._id}`}
                        className="hover:text-purple-600 transition-colors"
                      >
                        {student.student_batch?.session_name || "N/A"}
                      </Link>
                    </td>

                    <td className="px-6 py-4 font-medium text-indigo-600 whitespace-nowrap">
                      {student.assigned_company_id ? (
                        <Link
                          to={`/dean/dashboard/companyprofile/${student.assigned_company_id}`}
                          className="hover:text-indigo-800 transition-colors"
                        >
                          {student.assigned_company || "Assigned Company"}
                        </Link>
                      ) : (
                        <span className="text-gray-400 italic">
                          Not assigned
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/dean/dashboard/studentprofile/${student._id}`}
                        className="hover:text-purple-600 transition-colors"
                      >
                        <div className="flex flex-col text-sm">
                          <span className="font-semibold text-gray-900">
                            Approved: {approvedHours.toFixed(1)}h
                          </span>
                          <span className="text-xs text-gray-500">
                            Remaining: {remainingHours.toFixed(1)}h
                          </span>
                        </div>
                      </Link>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/dean/dashboard/studentprofile/${student._id}`}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            student.ojt_status === "completed"
                              ? "bg-green-100 text-green-700"
                              : student.ojt_status === "active"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {student.ojt_status || "pending"}
                        </span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StudentList;
