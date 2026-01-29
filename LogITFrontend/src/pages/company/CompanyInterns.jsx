import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Search, Loader2, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function CompanyInterns() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [students, setStudents] = useState([]); // This holds the Table data

  const { api } = useAuth();

  // --- FETCH ALREADY ASSIGNED INTERNS ON LOAD ---
  useEffect(() => {
    const fetchAssignedInterns = async () => {
      try {
        const res = await api.get("/company/assignedInterns");
        setStudents(res.data); // Corrected from 'st' to 'setStudents'
      } catch (err) {
        console.error("Failed to fetch assigned interns:", err);
      }
    };
    fetchAssignedInterns();
  }, [api]);

  // ---DEBOUNCE SEARCH INPUT ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 5000); 
    return () => clearTimeout(handler);
  }, [query]);

  // --- SEARCH API CALL ---
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (debouncedQuery.trim().length > 2) {
    IsSearching(true);
        try {
          const res = await api.get(
            `/company/searchStudents?name=${debouncedQuery}`,
          );
          setSearchResults(res.data);
        } catch (err) {
          console.error("Search failed:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };
    fetchSearchResults();
  }, [debouncedQuery, api]);

  // --- ASSIGN STUDENT ACTION ---
  const handleAssign = async (studentId) => {
    try {
      const response = await api.post("/company/assignStudent", { studentId });

      // Add the newly assigned student to the table state immediately
      setStudents((prev) => [...prev, response.data]);

      // Clear search
      setQuery("");
      setSearchResults([]);
      alert("Student assigned successfully!");
    } catch (error) {
      console.error("Assignment error:", error);
      alert(error.response?.data?.message || "Failed to assign student.");
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Company Interns
        </h1>
        <p className="text-gray-500 mt-1">
          Manage current interns and hire new ones.
        </p>
      </header>

      {/* SEARCH INPUT */}
      <section className="relative max-w-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hire New Interns
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search student name..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isSearching && (
            <div className="absolute right-3 top-3">
              <Loader2 className="animate-spin text-blue-500" size={20} />
            </div>
          )}
        </div>

        {/* SEARCH RESULTS OVERLAY */}
        {searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
            {searchResults.map((student) => (
              <div
                key={student._id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 border-b last:border-0"
              >
                <div>
                  <h4 className="font-bold text-gray-900">{student.name}</h4>
                  <p className="text-xs text-gray-500">
                    {student.student_course}
                  </p>
                </div>
                <Button size="sm" onClick={() => handleAssign(student._id)}>
                  <UserPlus size={14} className="mr-1" /> Add
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ASSIGNED INTERNS TABLE */}
      <Card elevated>
        <CardHeader withBorder>
          <div className="flex items-center justify-between">
            <CardTitle>Currently Assigned Interns</CardTitle>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
              {students.length} Interns
            </span>
          </div>
        </CardHeader>
        <CardContent padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Course</th>
                  <th className="px-6 py-4 font-semibold">Admission #</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      No interns currently assigned.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {student.student_course}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {student.student_admission_number}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CompanyInterns;
