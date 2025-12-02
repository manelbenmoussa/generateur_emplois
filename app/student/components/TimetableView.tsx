"use client";

import { useState, useEffect } from "react";

interface TimetableViewProps {
  userId?: string;
}

type StudentSession = {
  id: number;
  subject: string | null;
  teacher: string | null;
  room: string | null;
  weekday: string | null; // may come as 'MONDAY' or 'Monday'
  time: string | null; // e.g. '08:00'
  duration?: string | null;
  group?: { id: number; level?: string | null } | null;
};

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const FULL_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function normalizeDay(raw?: string | null) {
  if (!raw) return "Unscheduled";
  const lower = raw.toLowerCase();
  // try to match to our WEEK_DAYS
  for (const d of WEEK_DAYS) {
    if (d.toLowerCase() === lower) return d;
  }
  // also accept uppercase like 'MONDAY'
  const cap = lower.charAt(0).toUpperCase() + lower.slice(1);
  return cap;
}

function renderPrintableTimetable(sessions: StudentSession[]) {
  const times = Array.from(
    new Set(sessions.map((s) => s.time).filter((t): t is string => !!t))
  ).sort();
  const rows = times.length > 0 ? times : ["--"];

  const map = new Map<string, Map<string, StudentSession[]>>();
  for (const s of sessions) {
    const day = normalizeDay(s.weekday) ?? "Unscheduled";
    const time = s.time ?? "--";
    if (!map.has(day)) map.set(day, new Map());
    const row = map.get(day)!;
    if (!row.has(time)) row.set(time, []);
    row.get(time)!.push(s);
  }

  let html = `<div style="padding:20px;color:#fff;font-family:Arial,Helvetica,sans-serif;">`;
  html += `<h2 style="margin-bottom:12px;">My Timetable</h2>`;
  html += `<table style="width:100%;border-collapse:collapse;"><thead><tr><th style="padding:8px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.04);text-align:left">Time</th>`;
  for (const d of WEEK_DAYS)
    html += `<th style="padding:8px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.04);text-align:left">${d}</th>`;
  html += `</tr></thead><tbody>`;

  for (const time of rows) {
    html += `<tr><td style="padding:8px;border:1px solid rgba(255,255,255,0.06);vertical-align:top">${
      time === "--" ? "" : time
    }</td>`;
    for (const d of WEEK_DAYS) {
      const dayRow = map.get(d);
      const items = dayRow?.get(time) ?? [];
      html += `<td style="padding:8px;border:1px solid rgba(255,255,255,0.06);vertical-align:top">`;
      if (items.length === 0) html += `<div style="color:#9ca3af">—</div>`;
      else {
        for (const it of items) {
          html += `<div style="background:linear-gradient(90deg,#1e3a8a,#6d28d9);padding:8px;border-radius:6px;margin-bottom:6px;color:#fff">
            <div style="font-weight:600">${it.subject ?? "(No subject)"}</div>
            <div style="font-size:12px;opacity:0.9">${
              it.teacher ?? "Teacher -"
            }</div>
            <div style="font-size:12px;opacity:0.9">${it.room ?? "Room -"}</div>
          </div>`;
        }
      }
      html += `</td>`;
    }
    html += `</tr>`;
  }

  html += `</tbody></table></div>`;
  return html;
}

export default function TimetableView({ userId }: TimetableViewProps) {
  const [sessions, setSessions] = useState<StudentSession[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // student sessions endpoint relies on the server session
        const res = await fetch(`/api/student/sessions`);
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error ?? "Failed to load timetable");
          setSessions([]);
        } else {
          // API returns { sessions: [...] }
          setSessions((data.sessions ?? []) as StudentSession[]);
        }
      } catch (err) {
        setError(err?.message ?? "Network error");
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            📅 Weekly Timetable
          </h2>
          {sessions &&
            sessions.length > 0 &&
            (() => {
              const g = sessions.find((s) => s.group && s.group.level)?.group
                ?.level;
              return g ? (
                <div className="text-sm text-gray-300 mt-1">
                  Group: <span className="text-white font-semibold">{g}</span>
                </div>
              ) : null;
            })()}
        </div>
        <div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
            onClick={async () => {
              if (!sessions) return;
              try {
                const [{ default: html2canvas }, { jsPDF }] = await Promise.all(
                  [import("html2canvas"), import("jspdf")]
                );

                const container = document.createElement("div");
                container.style.position = "fixed";
                container.style.left = "-9999px";
                container.style.top = "0";
                container.style.width = "1200px";
                container.innerHTML = renderPrintableTimetable(sessions);
                document.body.appendChild(container);

                await new Promise((r) => setTimeout(r, 250));

                const canvas = await html2canvas(container as HTMLElement, {
                  scale: 2,
                  backgroundColor: "#0b1020",
                  useCORS: true,
                });

                const imgData = canvas.toDataURL("image/png");

                const pdf = new jsPDF({
                  orientation: "landscape",
                  unit: "pt",
                  format: "a4",
                });
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                const imgProps = pdf.getImageProperties(imgData);
                const imgWidth = imgProps.width;
                const imgHeight = imgProps.height;
                const ratio = imgHeight / imgWidth;
                const renderHeight = pdfWidth * ratio;
                let remainingHeight = renderHeight;
                let position = 0;

                if (renderHeight <= pdfHeight) {
                  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, renderHeight);
                } else {
                  const pageCanvas = document.createElement("canvas");
                  pageCanvas.width = canvas.width;
                  pageCanvas.height = Math.floor(
                    (canvas.width * pdfHeight) / pdfWidth
                  );
                  const pageCtx = pageCanvas.getContext("2d")!;

                  while (remainingHeight > 0) {
                    pageCtx.clearRect(
                      0,
                      0,
                      pageCanvas.width,
                      pageCanvas.height
                    );
                    pageCtx.drawImage(
                      canvas,
                      0,
                      position,
                      canvas.width,
                      pageCanvas.height,
                      0,
                      0,
                      pageCanvas.width,
                      pageCanvas.height
                    );

                    const pageData = pageCanvas.toDataURL("image/png");
                    pdf.addImage(pageData, "PNG", 0, 0, pdfWidth, pdfHeight);
                    remainingHeight -= pdfHeight;
                    position += pageCanvas.height;
                    if (remainingHeight > 0) pdf.addPage();
                  }
                }

                pdf.save("timetable.pdf");
                document.body.removeChild(container);
              } catch (err) {
                console.error("PDF generation failed", err);
                const printable = document.createElement("div");
                printable.innerHTML = renderPrintableTimetable(sessions || []);
                const w = window.open(
                  "",
                  "_blank",
                  "noopener,noreferrer,width=900,height=700"
                );
                if (!w) return;
                w.document.write(
                  `<!doctype html><html><head><meta charset="utf-8"><title>Timetable</title><style>body{font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#0b1020; color:#fff;} .table{width:100%;border-collapse:collapse} .cell{border:1px solid rgba(255,255,255,0.06);padding:10px;vertical-align:top} .header{background:rgba(255,255,255,0.04);font-weight:600} .session{background:linear-gradient(90deg,#1e3a8a,#6d28d9);padding:8px;border-radius:6px}</style></head><body>` +
                    printable.innerHTML +
                    `</body></html>`
                );
                w.document.close();
                w.focus();
                setTimeout(() => {
                  try {
                    w.print();
                  } catch {
                    /* ignore */
                  }
                }, 300);
              }
            }}
          >
            Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-white">Loading timetable...</div>
          ) : error ? (
            <div className="p-6 text-red-300">{error}</div>
          ) : sessions && sessions.length === 0 ? (
            <div className="p-6 text-gray-300">
              No scheduled sessions found.
            </div>
          ) : (
            <div className="min-w-[800px] p-4">
              {
                // render grid
              }
              <table className="w-full table-auto text-left text-sm text-white">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-3 py-2 header">Time</th>
                    {WEEK_DAYS.map((d) => (
                      <th key={d} className="px-3 py-2 header">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const times = Array.from(
                      new Set(
                        (sessions || [])
                          .map((s) => s.time)
                          .filter((t): t is string => !!t)
                      )
                    ).sort();
                    const rows = times.length > 0 ? times : ["--"];

                    const map = new Map<
                      string,
                      Map<string, StudentSession[]>
                    >();
                    for (const s of sessions || []) {
                      const day = normalizeDay(s.weekday) ?? "Unscheduled";
                      const time = s.time ?? "--";
                      if (!map.has(day)) map.set(day, new Map());
                      const row = map.get(day)!;
                      if (!row.has(time)) row.set(time, []);
                      row.get(time)!.push(s);
                    }

                    return rows.map((time) => (
                      <tr key={time}>
                        <td className="px-3 py-2 align-top cell">
                          {time === "--" ? "" : time}
                        </td>
                        {WEEK_DAYS.map((d) => {
                          const dayRow = map.get(d);
                          const items = dayRow?.get(time) ?? [];
                          return (
                            <td key={d} className="px-3 py-2 align-top cell">
                              <div className="flex flex-col gap-2">
                                {items.length === 0 ? (
                                  <div className="text-gray-300">—</div>
                                ) : (
                                  items.map((it) => (
                                    <div
                                      key={it.id}
                                      className="session bg-gradient-to-br from-blue-600/80 to-purple-600/80 rounded-lg p-3"
                                    >
                                      <div className="font-semibold">
                                        {it.subject ?? "(No subject)"}
                                      </div>
                                      <div className="text-xs text-white/90">
                                        {it.teacher ?? "Teacher -"}
                                      </div>
                                      <div className="text-xs text-white/80">
                                        {it.room ?? "Room -"}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
          <p className="text-gray-300 text-sm mb-1">Total Classes</p>
          <p className="text-2xl font-bold text-white">
            {(sessions || []).length}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
          <p className="text-gray-300 text-sm mb-1">Total Hours</p>
          <p className="text-2xl font-bold text-white">
            {(() => {
              const total = (sessions || []).reduce((sum, s) => {
                const d = parseFloat(s.duration ?? "");
                return sum + (isFinite(d) && d > 0 ? d : 1.5);
              }, 0);
              // display with one decimal if needed
              return `${
                Number.isInteger(total) ? String(total) : total.toFixed(1)
              }h`;
            })()}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
          <p className="text-gray-300 text-sm mb-1">Free Days</p>
          <p className="text-2xl font-bold text-white">
            {(() => {
              const daysWithClasses = new Set(
                (sessions || [])
                  .map((s) => normalizeDay(s.weekday))
                  .filter((d) => FULL_WEEK.includes(d))
              ).size;
              return 7 - daysWithClasses;
            })()}
          </p>
        </div>
      </div>
    </div>
  );
}
