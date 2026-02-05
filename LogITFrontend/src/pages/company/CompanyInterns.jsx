import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  Search,
  Loader2,
  UserPlus,
  Users,
  Briefcase,
  GraduationCap,
  Building2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

function CompanyInterns() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [students, setStudents] = useState([]);

  const { api } = useAuth();

  // 1. Fetch Assigned Interns (On Mount)
  useEffect(() => {
    const fetchAssignedInterns = async () => {
      try {
        const res = await api.get("/company/assignedInterns");
        setStudents(res.data);
      } catch (err) {
        console.error("Failed to fetch assigned interns:", err);
        toast.error("Failed to fetch interns");
      }
    };
    fetchAssignedInterns();
  }, [api]);

  // 2. Debounce Logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // 3. Search API Call
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (debouncedQuery.trim().length > 2) {
        setIsSearching(true);
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
      toast.success("Student assigned successfully!");
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error(error.response?.data?.message || "Failed to assign student.");
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="bg-purple-700 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users size={32} />
              <h1 className="text-3xl font-bold">Intern Management</h1>
            </div>
            <p className="text-blue-100 text-lg">
              Manage your current interns and hire new talent
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex bg-white/10 backdrop-blur-sm rounded-lg p-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{students.length}</p>
                <p className="text-xs text-blue-100 uppercase tracking-wide">
                  Total Interns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Search & Hire */}
        <div className="lg:col-span-1 space-y-6">
          <Card elevated className="h-full border-t-4 border-t-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <UserPlus className="text-blue-600" size={24} />
                Hire New Intern
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Search for students looking for internship
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative mt-2">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-3.5 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search by student name..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-3.5">
                      <Loader2
                        className="animate-spin text-blue-500"
                        size={18}
                      />
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto divide-y divide-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    {searchResults.map((student) => (
                      <div
                        key={student._id}
                        className="p-4 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {student.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <GraduationCap size={12} />{" "}
                              {student.student_course || "N/A"}
                            </span>
                            <span>•</span>
                            <span>{student.student_admission_number}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAssign(student._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        >
                          <UserPlus size={16} className="mr-1" /> Hire
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {query.length > 2 &&
                  searchResults.length === 0 &&
                  !isSearching && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-6 text-center text-gray-500">
                      <p>No available students found matching "{query}"</p>
                    </div>
                  )}
              </div>

              <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h4 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-2">
                  <Briefcase size={16} /> Quick Tip
                </h4>
                <p className="text-xs text-blue-700">
                  Students already assigned to a company will not appear in
                  search results.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Intern List */}
        <div className="lg:col-span-2">
          <Card
            elevated
            className="overflow-hidden border-t-4 border-t-indigo-500"
          >
            <CardHeader withBorder className="bg-gray-50/50">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="text-indigo-600" size={24} />
                  Assigned Team ({students.length})
                </CardTitle>
                <div className="flex gap-2">{/* Filter placeholder */}</div>
              </div>
            </CardHeader>
            <CardContent padding="none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold w-1/3">
                        Intern Details
                      </th>
                      <th className="px-6 py-4 font-semibold">Course</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <Building2
                              size={48}
                              className="mb-4 text-gray-300"
                              strokeWidth={1.5}
                            />
                            <p className="text-lg font-medium text-gray-500">
                              No interns assigned yet
                            </p>
                            <p className="text-sm mt-1">
                              Search and hire students to build your team.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => (
                        <tr
                          key={student._id}
                          className="hover:bg-indigo-50/30 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {student.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {student.student_admission_number}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {student.student_course}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                              <span className="text-gray-600 font-medium text-xs">
                                Active
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                              onClick={() => toast("Profile view coming soon!")}
                            >
                              View Profile
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
      </div>
    </div>
  );
}

export default CompanyInterns;
