import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import { Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

function AlumniBatchDetails() {
  const { api } = useAuth();
  const { batchId } = useParams();
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchBatchDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/dean/alumni/batch/${batchId}`);
        setBatch(response.data?.batch || null);
        setStudents(response.data?.students || []);
      } catch (error) {
        console.error("Error fetching alumni batch details:", error);
        toast.error("Failed to load alumni details");
      } finally {
        setLoading(false);
      }
    };

    fetchBatchDetails();
  }, [api, batchId]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();

    const toSearchable = (value) => {
      if (value === null || value === undefined) return "";
      return String(value).toLowerCase();
    };

    return students.filter((student) => {
      const approved = Number(student.approved_hours || 0).toFixed(1);
      return (
        toSearchable(student.name).includes(query) ||
        toSearchable(student.student_admission_number).includes(query) ||
        toSearchable(student.student_course).includes(query) ||
        toSearchable(student.assigned_company).includes(query) ||
        approved.includes(query)
      );
    });
  }, [students, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-b from-purple-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Alumini</h1>
            <p className="text-purple-100 text-lg">
              {batch
                ? `Batch ${batch.session_name} • ${batch.year}`
                : "Batch details"}
            </p>
          </div>
          <div className="w-full md:w-80 relative">
            <Search
              className="absolute left-3 top-3.5 text-gray-300"
              size={18}
            />
            <input
              type="text"
              placeholder="Search name, company, course, admission no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 text-white placeholder:text-purple-100 focus:outline-none focus:ring-2 focus:ring-white/60"
            />
          </div>
        </div>
      </div>

      <Card elevated className="shadow-lg">
        <CardHeader withBorder className="bg-gray-50">
          <CardTitle>Alumni Students</CardTitle>
          <CardDescription>
            {loading
              ? "Loading alumni students..."
              : `Showing ${filteredStudents.length} of ${students.length} students`}
          </CardDescription>
        </CardHeader>
        <CardContent padding="none" className="bg-white">
          {loading ? (
            <div className="p-10 text-center text-gray-400 animate-pulse">
              Loading alumni details...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No alumni students found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-700">
                      Admission No
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-700">
                      Course
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-700">
                      Company
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-700">
                      Approved Hours
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {student.student_admission_number}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {student.student_course}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {student.assigned_company || "Unassigned"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {Number(student.approved_hours || 0).toFixed(1)} hrs
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AlumniBatchDetails;
