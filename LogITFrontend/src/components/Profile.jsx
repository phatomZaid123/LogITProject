import { UserCircleIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function StudentProfile() {
  const { id } = useParams();
  const { api } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/dean/student/${id}`);
        setStudent(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching student:", err);
        const errorMsg =
          err.response?.data?.message || "Failed to fetch student details";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (id && api) {
      fetchStudentData();
    }
  }, [id, api]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <p className="text-red-600 font-semibold">
            {error || "Student not found"}
          </p>
        </div>
      </div>
    );
  }

  const studentName = student?.name || "N/A";
  const studentCourse = student?.student_course || "N/A";
  const studentEmail = student?.email || "N/A";
  const studentAddress = student?.address || "N/A";
  const studentAge = student?.age || "N/A";
  const studentGender = student?.gender || "N/A";
  const studentContactNo = student?.contact_no || "N/A";
  const admissionNumber = student?.student_admission_number || "N/A";
  const batchName = student?.student_batch?.session_name || "N/A";
  const companyName = student?.company?.company_name || "Not assigned";

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-white px-8 py-6 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
            <UserCircleIcon className="h-16 w-16 text-gray-500" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-800">{studentName}</h1>
            <p className="text-sm text-gray-500">{studentCourse}</p>
          </div>
        </div>

        <button className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-md text-sm font-medium">
          GENERATE REPORT
        </button>
      </div>

      {/* Info Cards */}
      <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Information */}
        <InfoCard title="Student Information">
          <InfoItem label="Full Name" value={studentName} />
          <InfoItem label="Admission No." value={admissionNumber} />
          <InfoItem label="Course" value={studentCourse} />
          <InfoItem label="Batch" value={batchName} />
          <InfoItem label="Email" value={studentEmail} />
          <InfoItem label="Address" value={studentAddress} />
          <InfoItem label="Age" value={studentAge} />
          <InfoItem label="Gender" value={studentGender} />
          <InfoItem label="Contact no." value={studentContactNo} />
        </InfoCard>

        {/* Health Information
        <InfoCard title="Health Information">
          <InfoItem
            label="Vaccination Status"
            value={student?.vaccination_status || "N/A"}
          />
          <InfoItem
            label="First Dose"
            value={student?.first_dose_date || "N/A"}
          />
          <InfoItem
            label="Second Dose"
            value={student?.second_dose_date || "N/A"}
          />
          <InfoItem label="Booster" value={student?.booster_date || "N/A"} />
          <InfoItem
            label="Vax Booster"
            value={student?.vax_booster_date || "N/A"}
          />
        </InfoCard> */}

        {/* OJT Information */}
        <InfoCard title="OJT Information">
          <InfoItem label="Name of Company/School" value={companyName} />
          <InfoItem
            label="No. of hours to complete"
            value={student?.ojt_hours_required || "N/A"}
          />
          <InfoItem
            label="Hours Completed"
            value={student?.ojt_hours_completed || "0"}
          />
          <InfoItem label="Address" value={student?.company_address || "N/A"} />
          <InfoItem
            label="Name of Supervisor"
            value={student?.supervisor_name || "N/A"}
          />
          <InfoItem
            label="Contact no."
            value={student?.supervisor_contact || "N/A"}
          />
        </InfoCard>
      </div>
      <div className="bg-gray-500 mx-10">
        <h1>Student Reports</h1>
      </div>
    </div>
  );
}

/* Reusable Components */
function InfoCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-blue-800 font-semibold mb-4">{title}</h2>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <span className="font-semibold text-gray-700">{label}: </span>
      <span className="text-gray-600">{value}</span>
    </div>
  );
}
