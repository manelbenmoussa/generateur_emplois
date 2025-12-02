"use client";

import React from "react";
import CustomSelect from "./CustomSelect";

export default function SessionFilters({
  filterScheduled,
  setFilterScheduled,
  weekdayFilter,
  setWeekdayFilter,
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  clearFilters,
}: {
  filterScheduled: "all" | "scheduled" | "unscheduled";
  setFilterScheduled: React.Dispatch<
    React.SetStateAction<"all" | "scheduled" | "unscheduled">
  >;
  weekdayFilter: string;
  setWeekdayFilter: React.Dispatch<React.SetStateAction<string>>;
  sortBy: "group" | "subject" | "teacher" | "weekday" | "time";
  setSortBy: React.Dispatch<
    React.SetStateAction<"group" | "subject" | "teacher" | "weekday" | "time">
  >;
  sortDir: "asc" | "desc";
  setSortDir: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
  clearFilters: () => void;
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-200">Status:</label>
          <CustomSelect
            value={filterScheduled}
            onChange={(v) =>
              setFilterScheduled(v as "all" | "scheduled" | "unscheduled")
            }
            options={[
              { value: "all", label: "All" },
              { value: "scheduled", label: "Scheduled" },
              { value: "unscheduled", label: "Unscheduled" },
            ]}
            placeholder="All"
            width="w-36"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-200">Weekday:</label>
          <CustomSelect
            value={weekdayFilter}
            onChange={(v) => setWeekdayFilter(v)}
            options={[
              { value: "", label: "Any" },
              { value: "Monday", label: "Monday" },
              { value: "Tuesday", label: "Tuesday" },
              { value: "Wednesday", label: "Wednesday" },
              { value: "Thursday", label: "Thursday" },
              { value: "Friday", label: "Friday" },
            ]}
            placeholder="Any"
            width="w-40"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-200">Sort:</label>
          <CustomSelect
            value={sortBy}
            onChange={(v) =>
              setSortBy(
                v as "group" | "subject" | "teacher" | "weekday" | "time"
              )
            }
            options={[
              { value: "group", label: "Group" },
              { value: "subject", label: "Subject" },
              { value: "teacher", label: "Teacher" },
              { value: "weekday", label: "Weekday" },
              { value: "time", label: "Time" },
            ]}
            placeholder="Group"
            width="w-44"
          />
          <button
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            {sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={clearFilters}
            className="px-3 py-2 bg-gray-100 text-blue-900 rounded"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
