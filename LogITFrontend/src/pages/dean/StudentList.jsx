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
import QRCodeModal from "../../components/QRCodeModal";
import StudentListComponent from "../../components/StudentList";
import { Search, Filter, Plus, GraduationCap, QrCode } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

function StudentList() {
  const [addBatchOpen, setAddBatchOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [modalType, setModalType] = useState("");
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const courseOptions = ["BSCS", "BSIT", "BSSE", "BSDS"];

  const { api } = useAuth();

  // Filter students based on search query only (batch filtering is done via API)
  const filteredStudents = students.filter((student) => {
    // Filter by search query
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.name?.toLowerCase().includes(query) ||
      student.student_admission_number?.toLowerCase().includes(query) ||
      student.student_course?.toLowerCase().includes(query) ||
      student.assigned_company?.toLowerCase().includes(query)
    );
  });

  // Fetch students based on selected batch
  const fetchStudents = async (course) => {
    try {
      setLoading(true);

      if (course) {
        const studentsRes = await api.get(`/dean/students/course/${course}`);
        console.log("Students response from backend:", studentsRes.data);
        const studentsList = studentsRes.data || [];
        setStudents(studentsList);
      } else {
        // Fetch all students when "All Courses" is selected
        const studentsRes = await api.get("/dean/getAllStudents");
        console.log("Students response from backend:", studentsRes.data);
        const studentsList = studentsRes.data?.students || [];
        setStudents(studentsList);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      setLoading(false);
    }
  };

  // Fetch batches and initial students from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all batches from backend
        const batchRes = await api.get("/dean/getAllBatch");
        console.log("Batches from backend:", batchRes.data);
        const batchesList = batchRes.data || [];
        setBatches(batchesList);

        await fetchStudents("");
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

  const handleGetQRCode = async () => {
    try {
      const response = await api.get("/dean/registration/qr");

      if (response.data.success) {
        setQrData(response.data);
        setQrModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch QR code";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="bg-linear-to-b from-purple-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap size={32} />
              <h1 className="text-3xl font-bold">Student Management</h1>
            </div>
            <p className="text-purple-100 text-lg">
              Manage and monitor all OJT students
            </p>
          </div>
        </div>
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
            variant="outline"
            onClick={() => {
              setModalType("company");
              setAddBatchOpen(true);
            }}
            className="flex items-center gap-2 md:w-auto"
          >
            <Plus size={20} />
            Add Company
          </Button>
          <Button
            variant="outline"
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
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Student Registration Code
        </p>
        <Button
          variant="primary"
          onClick={handleGetQRCode}
          className="flex items-center gap-2 md:w-auto"
        >
          <QrCode size={20} /> Get QR Code
        </Button>
      </div>
      {/* Students Table Card */}
      <Card elevated className="shadow-lg">
        <CardHeader
          withBorder
          className="bg-gray-50 border-b-2 border-gray-200"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl mb-1">Students List {}</CardTitle>
              <CardDescription className="text-gray-600">
                {searchQuery || selectedCourse ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-gray-900">
                      {filteredStudents.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">
                      {students.length}
                    </span>{" "}
                    students
                  </>
                ) : (
                  <>
                    Total:{" "}
                    <span className="font-semibold text-gray-900">
                      {students.length}
                    </span>{" "}
                    students
                  </>
                )}
              </CardDescription>
            </div>
            <div className="md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Course
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
                name="course"
                id="course"
                onChange={(e) => {
                  const newCourse = e.target.value;
                  setSelectedCourse(newCourse);
                  fetchStudents(newCourse);
                }}
                value={selectedCourse}
              >
                <option value="">All Courses</option>
                {courseOptions.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent padding="none" className="bg-white">
          <StudentListComponent
            students={filteredStudents}
            selectedCourse={selectedCourse}
            searchQuery={searchQuery}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      {addBatchOpen && (
        <ModalForm
          onClose={() => setAddBatchOpen(false)}
          title={
            modalType === "batch"
              ? "Create Batch"
              : modalType === "company"
                ? "Add Company"
                : "Add Student"
          }
          batches={batches}
          onBatchCreated={handleBatchCreated}
        />
      )}

      {/* QR Code Modal */}
      {qrModalOpen && qrData && (
        <QRCodeModal onClose={() => setQrModalOpen(false)} qrData={qrData} />
      )}
    </div>
  );
}

export default StudentList;
