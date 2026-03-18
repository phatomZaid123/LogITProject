import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

const ratingSections = [
  {
    title: "I. Task Performance",
    fields: [
      { key: "qualityOfWork", label: "Quality of Work" },
      { key: "quantityOfWork", label: "Quantity of Work" },
      { key: "jobKnowledge", label: "Job Knowledge" },
      { key: "dependability", label: "Dependability" },
    ],
  },
  {
    title: "II. Attendance and Punctuality",
    fields: [
      { key: "attendance", label: "Attendance" },
      { key: "punctuality", label: "Punctuality" },
    ],
  },
  {
    title: "III. Work Attitude/Habits",
    fields: [
      { key: "trustworthinessReliability", label: "Trustworthiness and Reliability" },
      { key: "initiativeCooperation", label: "Initiative and Cooperation" },
      { key: "willingnessToLearn", label: "Willingness to Learn" },
    ],
  },
  {
    title: "IV. Personality and Appearance",
    fields: [
      { key: "grooming", label: "Grooming" },
      { key: "interpersonalSkills", label: "Interpersonal Skills" },
      { key: "courtesy", label: "Courtesy" },
    ],
  },
];

const ratingKeys = ratingSections.flatMap((section) =>
  section.fields.map((field) => field.key),
);

const initialRatings = ratingKeys.reduce((acc, key) => {
  acc[key] = 3;
  return acc;
}, {});

const remarkOptions = [
  {
    value: "absorb_student",
    label: "The company will absorb the student-trainee",
  },
  {
    value: "consider_future_hiring",
    label: "The company will consider the student-trainee for future hiring",
  },
  {
    value: "highly_recommended",
    label: "Highly recommended for placement",
  },
  {
    value: "moderately_recommended",
    label: "Moderately recommended for placement",
  },
  {
    value: "not_recommended",
    label: "Not recommended for placement",
  },
  {
    value: "needs_orientation",
    label: "Needs proper orientation and acquire more skills",
  },
];

const legacyRecommendationMap = {
  recommend: "highly_recommended",
  recommend_with_reservation: "moderately_recommended",
  do_not_recommend: "not_recommended",
};

function EvaluationForm({ studentId, api, evaluation, progress, onSubmitted }) {
  const [ratings, setRatings] = useState(initialRatings);
  const [strengths, setStrengths] = useState("");
  const [areasForImprovement, setAreasForImprovement] = useState("");
  const [remarks, setRemarks] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [certificateFile, setCertificateFile] = useState(null);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);

  useEffect(() => {
    if (!evaluation) return;

    const nextRatings = ratingKeys.reduce((acc, key) => {
      acc[key] = Number(evaluation.ratings?.[key] || 3);
      return acc;
    }, {});
    setRatings(nextRatings);
    setStrengths(evaluation.strengths || "");
    setAreasForImprovement(evaluation.areasForImprovement || "");
    const incomingRemarks = Array.isArray(evaluation.remarks)
      ? evaluation.remarks
      : [];
    if (!incomingRemarks.length && evaluation.recommendation) {
      const mapped = legacyRecommendationMap[evaluation.recommendation];
      setRemarks(mapped ? [mapped] : []);
    } else {
      setRemarks(incomingRemarks);
    }
  }, [evaluation]);

  const average = useMemo(() => {
    const values = Object.values(ratings).map((value) => Number(value || 0));
    const total = values.reduce((sum, value) => sum + value, 0);
    return values.length ? (total / values.length).toFixed(2) : "0.00";
  }, [ratings]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!studentId || !api) return;
    if (!remarks.length) {
      toast.error("Please select at least one remark.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.put(
        `/company/student/${studentId}/evaluation`,
        {
          ratings,
          strengths,
          areasForImprovement,
          remarks,
        },
      );

      const saved = response?.data?.data;
      toast.success(
        evaluation
          ? "Evaluation updated successfully"
          : "Evaluation submitted successfully",
      );
      onSubmitted?.(saved);
      setCertificateFile(null);
      setShowUploadModal(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit evaluation",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCertificationUpload = async () => {
    if (!certificateFile || !api || !studentId) return;

    try {
      setUploadingCertificate(true);
      const formData = new FormData();
      formData.append("documents", certificateFile);

      await api.post(`/company/student/${studentId}/certification`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Certification uploaded successfully");
      setShowUploadModal(false);
      setCertificateFile(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to upload certification",
      );
    } finally {
      setUploadingCertificate(false);
    }
  };

  const hasRequiredHours =
    Number(progress?.completed || 0) >= Number(progress?.required || 0);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Company Evaluation
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
              Avg: {average} / 5
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </button>
          </div>
        </div>

        {isExpanded && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Rate the intern from 1 (lowest) to 5 (highest).
            </p>

            {!hasRequiredHours && (
              <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Evaluation can only be submitted after required hours are
                completed.
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {ratingSections.map((section) => (
                <div key={section.title} className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">
                    {section.title}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map((field) => (
                      <label key={field.key} className="text-sm text-gray-700">
                        <span className="block mb-1 font-semibold">
                          {field.label}
                        </span>
                        <select
                          className="w-full border border-gray-300 rounded-md px-3 py-2"
                          value={ratings[field.key]}
                          onChange={(event) =>
                            setRatings((prev) => ({
                              ...prev,
                              [field.key]: Number(event.target.value),
                            }))
                          }
                        >
                          {[1, 2, 3, 4, 5].map((value) => (
                            <option key={`${field.key}-${value}`} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <label className="text-sm text-gray-700 block">
                <span className="block mb-1 font-semibold">
                  Describe the student's strong personality and his/her
                  performance in work
                </span>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-24"
                  value={strengths}
                  onChange={(event) => setStrengths(event.target.value)}
                  placeholder="Describe strengths and work performance"
                />
              </label>

              <label className="text-sm text-gray-700 block">
                <span className="block mb-1 font-semibold">
                  Describe the student's areas that need improvement
                </span>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-24"
                  value={areasForImprovement}
                  onChange={(event) => setAreasForImprovement(event.target.value)}
                  placeholder="Describe areas for improvement"
                />
              </label>

              <div className="space-y-2">
                <span className="block text-sm font-semibold text-gray-700">
                  Remarks (check all that apply)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {remarkOptions.map((option) => {
                    const checked = remarks.includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={checked}
                          onChange={(event) => {
                            const isChecked = event.target.checked;
                            setRemarks((prev) =>
                              isChecked
                                ? [...prev, option.value]
                                : prev.filter((item) => item !== option.value),
                            );
                          }}
                        />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !hasRequiredHours}
                  className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting
                    ? "Submitting..."
                    : evaluation
                      ? "Update Evaluation"
                      : "Submit Evaluation"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                Upload Certification
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <p className="text-sm text-gray-600">
                Please upload the student's certification to complete the
                evaluation process.
              </p>
              <div className="border border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  className="block w-full text-sm text-gray-700"
                  onChange={(event) =>
                    setCertificateFile(event.target.files?.[0] || null)
                  }
                />
                {certificateFile && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {certificateFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-sm font-semibold text-gray-600 hover:text-gray-800"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={handleCertificationUpload}
                disabled={!certificateFile || uploadingCertificate}
                className="bg-indigo-600 text-white text-sm font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {uploadingCertificate ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EvaluationForm;
