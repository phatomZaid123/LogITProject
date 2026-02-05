import React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const WeekSelector = ({ weeks, currentWeekIndex, onChange, onWeekChange }) => {
  if (!weeks || weeks.length === 0) return null;

  const currentWeek = weeks[currentWeekIndex];
  const handleChange = onChange || onWeekChange;
  const statusLabel = currentWeek.weekStatus || "Draft";
  const statusStyle =
    {
      Draft: "bg-gray-50 text-gray-600 border border-gray-200",
      "Company Review": "bg-amber-50 text-amber-600 border border-amber-100",
      "Needs Revision": "bg-red-50 text-red-600 border border-red-100",
      "Ready for Dean": "bg-blue-50 text-blue-600 border border-blue-100",
      "Dean Review": "bg-indigo-50 text-indigo-600 border border-indigo-100",
      Locked: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    }[statusLabel] || "bg-gray-50 text-gray-500 border border-gray-100";

  return (
    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-2 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
          <Calendar size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-800">
              Week {currentWeek.number}
            </h3>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${statusStyle}`}>
              {statusLabel}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
            {currentWeek.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {currentWeek.end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            <span className="mx-1 text-gray-200">|</span>
            <span className="text-purple-600 font-bold">{currentWeek.totalHours.toFixed(1)}h</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => handleChange && handleChange(Math.min(weeks.length - 1, currentWeekIndex + 1))}
          disabled={currentWeekIndex === weeks.length - 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Previous Week"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex gap-1 px-2">
          {weeks.slice(0, 5).map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentWeekIndex ? "w-4 bg-purple-500" : "w-1.5 bg-gray-200"
              }`}
            />
          ))}
          {weeks.length > 5 && <div className="text-[10px] text-gray-300">...</div>}
        </div>

        <button
          onClick={() => handleChange && handleChange(Math.max(0, currentWeekIndex - 1))}
          disabled={currentWeekIndex === 0}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Next Week"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};


export default WeekSelector;
