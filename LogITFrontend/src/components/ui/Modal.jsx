import { useState, useEffect } from "react";
import Button from "./Button";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ModalForm = ({ onClose, title, batches, onBatchCreated }) => {
  const [loading, setLoading] = useState(false);
  const [activeBatch, setActiveBatch] = useState("");
  const { api } = useAuth();

  // Fetch and set the active batch when modal opens
  useEffect(() => {
    const fetchActiveBatch = async () => {
      try {
        const response = await api.get("/dean/dashboard/stats");
        const currentBatch = response.data?.activeBatch;
        if (currentBatch) {
          setActiveBatch(currentBatch._id);
        }
      } catch (error) {
        console.error("Error fetching active batch:", error);
        // Fallback to first batch if available
        if (batches && batches.length > 0) {
          setActiveBatch(batches[0]._id);
        }
      }
    };

    if (title === "Add Student") {
      fetchActiveBatch();
    }
  }, [api, title, batches]);

  //Dean Creating the batch for student
  const submitStudentDetails = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (
      !data.studentName?.trim() ||
      !data.studentEmail?.trim() ||
      !data.studentPassword?.trim() ||
      !data.studentAdmissionNumber?.trim() ||
      !data.studentCourse?.trim() ||
      !data.studentBatch?.trim()
    ) {
      setLoading(false);
      return alert("Check your inputs!");
    }

    try {
      const response = await api.post("/dean/createStudent", data);

      if (response.status === 201) {
        toast.success("Student registered successfully!");
        onClose();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";
      console.error("Submission failed:", error);
      toast.error(`Registration failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  //Dean Creating the batch for student
  const submitBatchDetails = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (!data.batchName?.trim() || !/^\d{4}$/.test(data.batchYear)) {
      setLoading(false);
      return alert("Check your inputs!");
    }

    try {
      const response = await api.post("/dean/createBatch", data);

      if (response.status === 201) {
        // Pass both links and batch name to parent
        if (onBatchCreated) {
          onBatchCreated({
            batchName: data.batchName,
            studentLink: response.data.inviteLink,
            companyLink: response.data.companyInviteLink,
          });
          toast.success(`Batch ${data.batchName} created successfully!`);
          console.log(response.data);
        }
        onClose();
      }
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Overlay: Handles blur and centering
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {title === "Add Student"
              ? "Fill in the details to register a new student"
              : "Create a new batch for student management"}
          </p>
        </div>

        {title === "Add Student" ? (
          // STUDENT FORM
          <form
            onSubmit={submitStudentDetails}
            action=""
            method="post"
            className="space-y-6"
          >
            {/* Personal Information Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="studentEmail"
                    placeholder="john.doe@example.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admission Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentAdmissionNumber"
                    placeholder="e.g., 2024-001"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentCourse"
                    placeholder="e.g., BSIT"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="studentBatch"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white"
                    value={activeBatch}
                    onChange={(e) => setActiveBatch(e.target.value)}
                    required
                  >
                    <option value="">Select a Batch</option>
                    {batches.map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.session_name} - {batch.year}
                      </option>
                    ))}
                  </select>
                  {activeBatch && (
                    <p className="text-xs text-purple-600 mt-1">
                      ✓ Current active batch selected
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="studentPassword"
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    minLength={8}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="px-6 py-2.5"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Register Student"
                )}
              </Button>
            </div>
          </form>
        ) : (
          // BATCH FORM
          <form
            onSubmit={submitBatchDetails}
            method="post"
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Name <span className="text-red-500">*</span>
              </label>
              <input
                name="batchName"
                required
                placeholder="e.g., Semester 1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <input
                name="batchYear"
                required
                type="number"
                pattern="\d{4}"
                placeholder="e.g., 2026"
                min="2000"
                max="2099"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the year (4 digits)
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5"
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="px-6 py-2.5"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Create Batch"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export { ModalForm };
