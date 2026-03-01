import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const ratingFields = [
  { key: "attendance", label: "Attendance" },
  { key: "cooperation", label: "Cooperation" },
  { key: "communication", label: "Communication" },
  { key: "technicalSkills", label: "Technical Skills" },
  { key: "professionalism", label: "Professionalism" },
];

const initialRatings = {
  attendance: 3,
  cooperation: 3,
  communication: 3,
  technicalSkills: 3,
  professionalism: 3,
};

function EvaluationForm({ studentId, api, evaluation, progress, onSubmitted }) {
  const [ratings, setRatings] = useState(initialRatings);
  const [strengths, setStrengths] = useState("");
  const [areasForImprovement, setAreasForImprovement] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [recommendation, setRecommendation] = useState("recommend");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!evaluation) return;

    setRatings({
      attendance: Number(evaluation.ratings?.attendance || 3),
      cooperation: Number(evaluation.ratings?.cooperation || 3),
      communication: Number(evaluation.ratings?.communication || 3),
      technicalSkills: Number(evaluation.ratings?.technicalSkills || 3),
      professionalism: Number(evaluation.ratings?.professionalism || 3),
    });
    setStrengths(evaluation.strengths || "");
    setAreasForImprovement(evaluation.areasForImprovement || "");
    setAdditionalComments(evaluation.additionalComments || "");
    setRecommendation(evaluation.recommendation || "recommend");
  }, [evaluation]);

  const average = useMemo(() => {
    const values = Object.values(ratings).map((value) => Number(value || 0));
    const total = values.reduce((sum, value) => sum + value, 0);
    return values.length ? (total / values.length).toFixed(2) : "0.00";
  }, [ratings]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!studentId || !api) return;

    try {
      setSubmitting(true);
      const response = await api.put(
        `/company/student/${studentId}/evaluation`,
        {
          ratings,
          strengths,
          areasForImprovement,
          additionalComments,
          recommendation,
        },
      );

      const saved = response?.data?.data;
      toast.success(
        evaluation
          ? "Evaluation updated successfully"
          : "Evaluation submitted successfully",
      );
      onSubmitted?.(saved);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit evaluation",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const hasRequiredHours =
    Number(progress?.completed || 0) >= Number(progress?.required || 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-bold text-gray-800">Company Evaluation</h2>
        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
          Avg: {average} / 5
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Rate the intern from 1 (lowest) to 5 (highest).
      </p>

      {!hasRequiredHours && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Evaluation can only be submitted after required hours are completed.
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ratingFields.map((field) => (
            <label key={field.key} className="text-sm text-gray-700">
              <span className="block mb-1 font-semibold">{field.label}</span>
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

        <label className="text-sm text-gray-700 block">
          <span className="block mb-1 font-semibold">Strengths</span>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-24"
            value={strengths}
            onChange={(event) => setStrengths(event.target.value)}
            placeholder="What did the student do well?"
          />
        </label>

        <label className="text-sm text-gray-700 block">
          <span className="block mb-1 font-semibold">
            Areas for Improvement
          </span>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-24"
            value={areasForImprovement}
            onChange={(event) => setAreasForImprovement(event.target.value)}
            placeholder="What should the student improve?"
          />
        </label>

        <label className="text-sm text-gray-700 block">
          <span className="block mb-1 font-semibold">Recommendation</span>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={recommendation}
            onChange={(event) => setRecommendation(event.target.value)}
          >
            <option value="recommend">Recommend</option>
            <option value="recommend_with_reservation">
              Recommend with reservation
            </option>
            <option value="do_not_recommend">Do not recommend</option>
          </select>
        </label>

        <label className="text-sm text-gray-700 block">
          <span className="block mb-1 font-semibold">Additional Comments</span>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-24"
            value={additionalComments}
            onChange={(event) => setAdditionalComments(event.target.value)}
            placeholder="Any additional feedback"
          />
        </label>

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
    </div>
  );
}

export default EvaluationForm;
