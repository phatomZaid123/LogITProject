import React from "react";

function StudentList() {
  const students = [
    {
      name: "Alice Johnson",
      id: "ADM-2026-001",
      course: "Computer Science",
      batch: "2026-A",
      company: "TechCorp",
    },
    {
      name: "Bob Smith",
      id: "ADM-2026-002",
      course: "Data Science",
      batch: "2026-B",
      company: "DataFlow",
    },
    {
      name: "Bob Smith",
      id: "ADM-2026-002",
      course: "Data Science",
      batch: "2026-B",
      company: "DataFlow",
    },
    {
      name: "Bob Smith",
      id: "ADM-2026-002",
      course: "Data Science",
      batch: "2026-B",
      company: "DataFlow",
    },
    {
      name: "Bob Smith",
      id: "ADM-2026-002",
      course: "Data Science",
      batch: "2026-B",
      company: "DataFlow",
    },
  ];

  return (
    // Outer container ensures no horizontal scroll on the body
    <div className="w-full bg-amber-600 px-2 py-4 text-purple-800">
      <h1 className="text-2xl text-center font-serif lg:text-4xl mb-6">
        Enrolled Students
      </h1>

      <div className="mx-auto max-w-6xl overflow-x-auto shadow-md rounded-lg border border-gray-200 text-purple-800">
        <table className="w-full text-sm text-left text-purple-800 bg-white">
          <thead className="text-sm  text-purple-800 uppercase bg-gray-50 border-b border-gray-200">
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
          <tbody className=" text-purple-800 divide-y divide-gray-200">
            {students.map((student, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-purple-800 whitespace-nowrap">
                  {student.name}
                </td>
                <td className="text-purple-800 px-6 py-4 whitespace-nowrap">
                  {student.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.course}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {student.batch}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-indigo-600 whitespace-nowrap">
                  {student.company}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentList;
