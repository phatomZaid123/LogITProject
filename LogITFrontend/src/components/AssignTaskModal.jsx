import { useState } from "react";
import Button from "./ui/Button";
import { X } from "lucide-react";

function AssignTaskModal({ open, onClose }) {
  const [formData, setFormData] = useState({
    student: "",
    instructions: "",
    deadline: "",
    file: null,
  });

  const students = [
    "John Smith",
    "Mary Johnson",
    "David Wilson",
    "Sarah Adams",
    "Daniel Brown",
  ];

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Assigned Task:", formData);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X />
        </button>

        {/* Header */}
        <h2 className="text-xl font-bold mb-4">Assign New Task</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Select */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Student
            </label>

            <input
              list="students"
              name="student"
              required
              placeholder="Search student..."
              value={formData.student}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <datalist id="students">
              {students.map((s, i) => (
                <option key={i} value={s} />
              ))}
            </datalist>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Task Instructions
            </label>

            <textarea
              name="instructions"
              required
              rows="4"
              placeholder="Explain what the student should do..."
              value={formData.instructions}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Attach Document
            </label>

            <input
              type="file"
              name="file"
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Submission Deadline
            </label>

            <input
              type="date"
              name="deadline"
              required
              value={formData.deadline}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" variant="primary">
              Assign Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignTaskModal;
