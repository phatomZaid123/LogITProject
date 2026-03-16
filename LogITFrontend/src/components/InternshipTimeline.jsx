import { Check } from "lucide-react";

const DEFAULT_STEPS = [
  { key: "enrolled", label: "Enrolled" },
  { key: "company_assigned", label: "Company Assigned" },
  { key: "documents_uploaded", label: "Documents Uploaded" },
  { key: "internship_completed", label: "Internship Completed" },
];

function InternshipTimeline({ currentStatus, status, steps = DEFAULT_STEPS }) {
  const resolvedStatus = currentStatus || status || steps[0]?.key;
  const statusAliases = {
    internship_started: "documents_uploaded",
  };
  const normalizedStatus = statusAliases[resolvedStatus] || resolvedStatus;
  const foundIndex = steps.findIndex((step) => step.key === normalizedStatus);
  const activeIndex = foundIndex === -1 ? 0 : foundIndex;

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="flex items-center min-w-140 sm:min-w-160 lg:min-w-180">
        {steps.map((step, index) => {
          const isCompleted = index <= activeIndex;
          const isActive = index === activeIndex;
          const isConnectorFilled = index < activeIndex;

          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center min-w-27.5 sm:min-w-37.5">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                    isCompleted
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : isActive
                        ? "border-blue-500 text-blue-600 bg-white"
                        : "border-gray-300 text-gray-400 bg-white"
                  } ${isActive ? (isCompleted ? "ring-4 ring-emerald-100" : "ring-4 ring-blue-100") : ""}`}
                >
                  {isCompleted ? (
                    <Check size={18} strokeWidth={3} />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <p
                  className={`mt-2 text-[11px] sm:text-xs font-semibold tracking-tight ${
                    isCompleted || isActive ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {index < steps.length - 1 ? (
                <div className="flex-1 h-1 mx-3 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
                    style={{ width: isConnectorFilled ? "100%" : "0%" }}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InternshipTimeline;
