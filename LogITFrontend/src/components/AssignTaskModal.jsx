import { useEffect, useState } from "react";
import Button from "./ui/Button";
import { X } from "lucide-react";

const defaultState = {
  studentId: "",
  title: "",
  description: "",
  dueDate: "",
  resourceLink: "",
};

function AssignTaskModal({ open, onClose, students = [], onSubmit, submitting }) {
  const [formData, setFormData] = useState(defaultState);

  useEffect(() => {
    if (!open) {
      setFormData(defaultState);
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 md:p-8 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
          aria-label="Close assign task modal"
        >
          <X />
        </button>

        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-purple-400 font-semibold">
            Task Composer
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
            Assign New Task
          </h2>
          <p className="text-sm text-gray-500">
            Provide clear instructions, deadlines, and resources so your intern knows exactly what success looks like.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Build landing page wireframe"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To
              </label>
              <select
                name="studentId"
                required
                value={formData.studentId}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select your intern</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} • {student.student_admission_number}
                  </option>
                ))}
              </select>
              {students.length === 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  No interns are assigned to your company yet.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Instructions
            </label>
            <textarea
              name="description"
              rows="4"
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Outline the deliverables, quality bar, and any checkpoints you expect."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submission Deadline
              </label>
              <input
                type="date"
                name="dueDate"
                required
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resource Link (optional)
              </label>
              <input
                type="url"
                name="resourceLink"
                value={formData.resourceLink}
                onChange={handleChange}
                placeholder="https://drive.google.com/..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Share a brief, template, or inspiration link to speed up execution.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              disabled={students.length === 0}
            >
              Assign Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignTaskModal;
