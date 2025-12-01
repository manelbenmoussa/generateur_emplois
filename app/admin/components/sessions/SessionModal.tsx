import React from "react";
import type { RawSession } from "../SessionsCRUD";

interface SessionModalProps {
  open: boolean;
  type: "add" | "edit";
  session?: RawSession;
  actionLoading: boolean;
  actionError: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  subjectQuery: string;
  setSubjectQuery: (q: string) => void;
  subjectResults: { id: number; name: string }[];
  selectedSubject: number | null;
  setSelectedSubject: (id: number | null) => void;
  groupQuery: string;
  setGroupQuery: (q: string) => void;
  groupResults: { id: number; name: string }[];
  selectedGroup: number | null;
  setSelectedGroup: (id: number | null) => void;
  teacherQuery: string;
  setTeacherQuery: (q: string) => void;
  teacherResults: { id: number; name: string }[];
  selectedTeacher: number | null;
  setSelectedTeacher: (id: number | null) => void;
}

import Card from "../Card";

const SessionModal: React.FC<SessionModalProps> = (props) => {
  if (!props.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 bg-opacity-90 backdrop-blur-sm">
      <div className="flex items-center justify-center w-full min-h-screen">
        <Card className="border border-white/20 shadow-2xl rounded-2xl p-0 bg-white/95">
          <form className="p-10" onSubmit={props.onSubmit}>
            <h3 className="text-2xl font-bold mb-8 text-blue-900">
              {props.type === "add" ? "Add Session" : "Edit Session"}
            </h3>
            {/* Subject search */}
            <div className="mb-5 relative">
              <label className="block text-sm font-medium text-blue-900 mb-1">
                Subject
              </label>
              <input
                name="subjectId"
                type="text"
                autoComplete="off"
                value={
                  props.selectedSubject
                    ? props.subjectResults.find(
                        (s) => s.id === props.selectedSubject
                      )?.name || props.subjectQuery
                    : props.subjectQuery
                }
                onChange={(e) => {
                  props.setSubjectQuery(e.target.value);
                  props.setSelectedSubject(null);
                }}
                className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-blue-900"
                required
              />
              {props.subjectQuery &&
                !props.selectedSubject &&
                props.subjectResults.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-blue-200 rounded-lg mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
                    {props.subjectResults.map((subj) => (
                      <li
                        key={subj.id}
                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-blue-900"
                        onClick={() => {
                          props.setSelectedSubject(subj.id);
                          props.setSubjectQuery(subj.name);
                        }}
                      >
                        {subj.name}
                      </li>
                    ))}
                  </ul>
                )}
              <input
                type="hidden"
                name="subjectId"
                value={props.selectedSubject ?? ""}
              />
            </div>
            {/* Group search */}
            <div className="mb-5 relative">
              <label className="block text-sm font-medium text-blue-900 mb-1">
                Group
              </label>
              <input
                name="groupId"
                type="text"
                autoComplete="off"
                value={
                  props.selectedGroup
                    ? props.groupResults.find(
                        (g) => g.id === props.selectedGroup
                      )?.name || props.groupQuery
                    : props.groupQuery
                }
                onChange={(e) => {
                  props.setGroupQuery(e.target.value);
                  props.setSelectedGroup(null);
                }}
                className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-blue-900"
                required
              />
              {props.groupQuery &&
                !props.selectedGroup &&
                props.groupResults.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-blue-200 rounded-lg mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
                    {props.groupResults.map((grp) => (
                      <li
                        key={grp.id}
                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-blue-900"
                        onClick={() => {
                          props.setSelectedGroup(grp.id);
                          props.setGroupQuery(grp.name);
                        }}
                      >
                        {grp.name}
                      </li>
                    ))}
                  </ul>
                )}
              <input
                type="hidden"
                name="groupId"
                value={props.selectedGroup ?? ""}
              />
            </div>
            {/* Teacher search */}
            <div className="mb-5 relative">
              <label className="block text-sm font-medium text-blue-900 mb-1">
                Teacher
              </label>
              <input
                name="teacherId"
                type="text"
                autoComplete="off"
                value={
                  props.selectedTeacher
                    ? props.teacherResults.find(
                        (t) => t.id === props.selectedTeacher
                      )?.name || props.teacherQuery
                    : props.teacherQuery
                }
                onChange={(e) => {
                  props.setTeacherQuery(e.target.value);
                  props.setSelectedTeacher(null);
                }}
                className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-blue-900"
                required
              />
              {props.teacherQuery &&
                !props.selectedTeacher &&
                props.teacherResults.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-blue-200 rounded-lg mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
                    {props.teacherResults.map((t) => (
                      <li
                        key={t.id}
                        className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-blue-900"
                        onClick={() => {
                          props.setSelectedTeacher(t.id);
                          props.setTeacherQuery(t.name);
                        }}
                      >
                        {t.name}
                      </li>
                    ))}
                  </ul>
                )}
              <input
                type="hidden"
                name="teacherId"
                value={props.selectedTeacher ?? ""}
              />
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-blue-900 mb-1">
                Weekday
              </label>
              <input
                name="scheduled_weekday"
                type="text"
                defaultValue={props.session?.scheduled_weekday ?? ""}
                className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-blue-900"
              />
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-blue-900 mb-1">
                Time
              </label>
              <input
                name="scheduled_time"
                type="text"
                defaultValue={props.session?.scheduled_time ?? ""}
                className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-blue-900"
              />
            </div>
            {props.actionError && (
              <div className="text-red-600 mb-5 text-sm font-medium">
                {props.actionError}
              </div>
            )}
            <div className="flex gap-4 mt-8 justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-60 shadow"
                disabled={props.actionLoading}
              >
                {props.actionLoading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="px-6 py-2 bg-gray-100 text-blue-900 rounded-lg font-semibold hover:bg-gray-200 border border-blue-200 shadow"
                onClick={props.onClose}
                disabled={props.actionLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SessionModal;
