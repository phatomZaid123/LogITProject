import React from "react";
import { X } from "lucide-react";
import WeeklyLogForm from "./WeeklyLogForm";

const WeeklyLogModal = ({ isOpen, onClose, refreshData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* Close Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800">
            Submit Weekly Report
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* The Form Component */}
        <WeeklyLogForm
          onSuccess={() => {
            refreshData(); // Refresh the list after upload
            onClose(); // Close the modal
          }}
        />
      </div>
    </div>
  );
};

export default WeeklyLogModal;
