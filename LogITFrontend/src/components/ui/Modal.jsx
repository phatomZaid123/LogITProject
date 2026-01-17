import { useState } from "react";
import Button from "./Button";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ModalForm = ({ onClose, title, batches, onBatchCreated }) => {
  const [loading, setLoading] = useState(false);
  const { api } = useAuth();

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
          console.log(response.data);
        }
        onClose();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";
      console.error("Submission failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Overlay: Handles blur and centering
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <h2 className="text-xl font-bold mb-4">{title}</h2>

        {title === "Create Student" ? (
          // STUDENT FORM
          <form
            onSubmit={submitStudentDetails}
            action=""
            method="post"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              name="studentName"
              placeholder="Full Name"
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="email"
              name="studentEmail"
              placeholder="Email"
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="password"
              name="studentPassword"
              placeholder="Password"
              className="border p-2 rounded w-full"
              minLength={8}
              required
            />
            <input
              type="text"
              name="studentAdmissionNumber"
              placeholder="Admission Number"
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="text"
              name="studentCourse"
              placeholder="Course"
              className="border p-2 rounded w-full"
              required
            />
            <select name="studentBatch" required>
              <option value="">Select a Batch</option>
              {batches.map((batch) => (
                <option key={batch._id} value={batch.session_name}>
                  {batch.session_name}{" "}
                  {/* User sees name, but value is the ID */}
                </option>
              ))}
            </select>

            <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4">
              <Button
                variant="danger"
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
                disabled={loading}
              >
                {loading ? "Processing..." : "Register Student"}
              </Button>
            </div>
          </form>
        ) : (
          // BATCH FORM
          <form
            onSubmit={submitBatchDetails}
            method="post"
            className="flex flex-col gap-4"
          >
            <input
              name="batchName"
              required
              placeholder="Batch Name"
              className="border p-2 rounded w-full"
            />

            <input
              name="batchYear"
              required
              pattern="\d{4}"
              placeholder="Year"
              className="border p-2 rounded w-full"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="danger"
                type="button"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Create Batch"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export { ModalForm };
