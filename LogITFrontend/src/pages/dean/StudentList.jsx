import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { ModalForm } from "../../components/ui/Modal";
import StudentListComponent from "../../components/StudentList";
import { Search, Filter, Plus, GraduationCap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function StudentList() {
  const [addBatchOpen, setAddBatchOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [modalType, setModalType] = useState("batch");
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { api } = useAuth();

  // Fetch batches and students from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all batches from backend
        const batchRes = await api.get("/dean/getAllBatch");
        console.log("Batches from backend:", batchRes.data);
        setBatches(batchRes.data || []);

        // Fetch all students from backend
        const studentsRes = await api.get("/dean/getAllStudents");
        console.log("Students response from backend:", studentsRes.data);

        // API returns { students: [...], companies: [...] }
        const studentsList = studentsRes.data?.students || [];
        setStudents(studentsList);
        console.log("Students", studentsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data from backend:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBatchCreated = (batchData) => {
    // Add new batch to list
    setBatches([
      ...batches,
      {
        _id: batchData.batchName.toLowerCase(),
        session_name: batchData.batchName,
      },
    ]);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-lg p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap size={32} />
          <h1 className="text-4xl font-bold">Student Management</h1>
        </div>
        <p className="text-purple-100 text-lg">
          Manage and monitor all OJT students
        </p>
      </div>

      {/* Filters and Actions Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-3.5 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name, admission number, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={18} /> Filter
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <Button
            variant="primary"
            onClick={() => {
              setModalType("student");
              setAddBatchOpen(true);
            }}
            className="flex items-center gap-2 md:w-auto"
          >
            <Plus size={20} /> Add Student
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setModalType("batch");
              setAddBatchOpen(true);
            }}
            className="flex items-center gap-2 md:w-auto"
          >
            <Plus size={20} /> Create Batch
          </Button>
        </div>
      </div>

      {/* Students Table Card */}
      <Card elevated className="shadow-lg">
        <CardHeader
          withBorder
          className="bg-gray-50 border-b-2 border-gray-200"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl mb-1">Students List</CardTitle>
              <CardDescription className="text-gray-600">
                Total:{" "}
                <span className="font-semibold text-gray-900">
                  {students.length}
                </span>{" "}
                students
              </CardDescription>
            </div>
            <div className="md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Batch
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
                name="batch"
                id="batch"
                onChange={(e) => setSelectedBatchId(e.target.value)}
                value={selectedBatchId}
              >
                <option value="">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.session_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent padding="none" className="bg-white">
          <StudentListComponent
            students={students}
            selectedBatchId={selectedBatchId}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      {addBatchOpen && (
        <ModalForm
          onClose={() => setAddBatchOpen(false)}
          title={modalType === "batch" ? "Create Batch" : "Add Student"}
          batches={batches}
          onBatchCreated={handleBatchCreated}
        />
      )}
    </div>
  );
}

export default StudentList;
