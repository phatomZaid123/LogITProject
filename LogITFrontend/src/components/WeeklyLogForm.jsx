import React, { useState } from "react";
import { Send, FilePlus, X, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import Button from "./ui/Button";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const WeeklyLogForm = ({ onSuccess }) => {
  const { api } = useAuth();
  const [formData, setFormData] = useState({
    weekNumber: "",
    weekStartDate: "",
    weekEndDate: "",
    dutiesAndResponsibilities: "",
    newThingsLearned: "",
    problemsEncountered: "",
    solutionsImplemented: "",
    accomplishmentsAndDeliverables: "",
    goalsForNextWeek: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle multiple file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  // Remove a file before uploading
  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all questions are answered
    const requiredFields = [
      "dutiesAndResponsibilities",
      "newThingsLearned",
      "problemsEncountered",
      "solutionsImplemented",
      "accomplishmentsAndDeliverables",
      "goalsForNextWeek",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      toast.error("Please answer all logbook questions");
      return;
    }

    setLoading(true);
    const data = new FormData();

    // Append all form fields
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    // Append files
    selectedFiles.forEach((file) => {
      data.append("doc_attachment", file);
    });

    try {
      await api.post("/student/logs", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Weekly log submitted successfully!");

      // Reset form
      setFormData({
        weekNumber: "",
        weekStartDate: "",
        weekEndDate: "",
        dutiesAndResponsibilities: "",
        newThingsLearned: "",
        problemsEncountered: "",
        solutionsImplemented: "",
        accomplishmentsAndDeliverables: "",
        goalsForNextWeek: "",
      });
      setSelectedFiles([]);

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.response?.data?.message || "Failed to submit log");
    } finally {
      setLoading(false);
    }
  };

  const questions = [
    {
      id: 1,
      label:
        "What have been your assigned duties and responsibilities this week?",
      name: "dutiesAndResponsibilities",
      placeholder: "Describe your main tasks and responsibilities...",
    },
    {
      id: 2,
      label: "What new things have you learned?",
      name: "newThingsLearned",
      placeholder: "Share new skills, knowledge, or insights gained...",
    },
    {
      id: 3,
      label: "What problems have you encountered this week?",
      name: "problemsEncountered",
      placeholder: "Describe any challenges or obstacles you faced...",
    },
    {
      id: 4,
      label: "How did you solve and overcome these problems?",
      name: "solutionsImplemented",
      placeholder: "Explain the solutions and approaches you used...",
    },
    {
      id: 5,
      label:
        "What have you accomplished this week and what are the deliverables that you have submitted?",
      name: "accomplishmentsAndDeliverables",
      placeholder: "List your achievements and completed deliverables...",
    },
    {
      id: 6,
      label: "List one or two goals you plan to accomplish next week?",
      name: "goalsForNextWeek",
      placeholder: "Outline your goals and objectives for next week...",
    },
  ];

  return (
    <div className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Week Information */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="text-purple-600" size={20} />
            <h3 className="text-sm font-bold text-purple-900">
              Week Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Week Number
              </label>
              <input
                type="number"
                name="weekNumber"
                value={formData.weekNumber}
                onChange={handleChange}
                placeholder="e.g., 1"
                className="w-full px-3 py-2 text-sm border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Week Start Date
              </label>
              <input
                type="date"
                name="weekStartDate"
                value={formData.weekStartDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Week End Date
              </label>
              <input
                type="date"
                name="weekEndDate"
                value={formData.weekEndDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* The 6 Logbook Questions */}
        <div className="space-y-5">
          {questions.map((question) => (
            <div
              key={question.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                <span className="text-purple-600 mr-2">{question.id}.</span>
                {question.label}
              </label>
              <textarea
                name={question.name}
                value={formData[question.name]}
                onChange={handleChange}
                rows="4"
                placeholder={question.placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm"
                required
              />
            </div>
          ))}
        </div>

        {/* File Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 text-center">
          <input
            type="file"
            id="file-upload"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <FilePlus className="text-purple-500 mb-2" size={32} />
            <span className="text-sm font-medium text-gray-700">
              Click to upload supporting documents or images
            </span>
            <span className="text-xs text-gray-500 mt-1">
              PDF, DOC, PNG, JPG (Optional)
            </span>
          </label>

          {/* File Preview List */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white p-2 rounded-lg border text-sm"
                >
                  <span className="truncate max-w-xs">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
          <Button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 px-6"
          >
            {loading ? (
              "Submitting..."
            ) : (
              <>
                <Send size={18} /> Submit Weekly Log
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WeeklyLogForm;
