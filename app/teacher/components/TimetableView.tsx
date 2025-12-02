"use client";

import { useEffect, useState } from "react";

interface TimetableViewProps {
  userId?: string;
}

// Helpers to render timetable grid
const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function renderTimetableGrid(sessions: TeacherSession[]) {
  // collect unique times from sessions
  const times = Array.from(
    new Set(
      sessions.map((s) => s.scheduled_time).filter((t): t is string => !!t)
    )
  ).sort();

  // If no explicit times found, fallback to a single row
  const rows = times.length > 0 ? times : ["--"];

  // map sessions by day and time
  const map = new Map<string, Map<string, TeacherSession[]>>();
  for (const s of sessions) {
    const day = s.scheduled_weekday ?? "Unscheduled";
    const time = s.scheduled_time ?? "--";
    if (!map.has(day)) map.set(day, new Map());
    const row = map.get(day)!;
    if (!row.has(time)) row.set(time, []);
    row.get(time)!.push(s);
  }

  // Render table-like grid
  return (
    <table className="table-auto table text-left text-sm text-white">
      <thead>
        <tr>
          <th className="px-3 py-2 header">Time</th>
          {WEEK_DAYS.map((d) => (
            <th key={d} className="px-3 py-2 header">
              {d}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((time) => (
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
                          className="bg-gradient-to-br from-blue-600/80 to-purple-600/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 cursor-pointer shadow-lg"
                        >
                          <p className="text-white font-semibold text-sm mb-1">
                            {it.subject ?? "(No subject)"}
                          </p>
                          <p className="text-xs text-gray-200 mb-1">
                            {it.group?.level
                              ? `Group ${it.group.level}`
                              : it.teacher?.name ?? "Teacher -"}
                          </p>
                          <p className="text-xs text-gray-200">
                            📍 {it.room?.name ?? "Room -"}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderPrintableTimetable(sessions: TeacherSession[]) {
  // Basic HTML representation similar to renderTimetableGrid
  const times = Array.from(
    new Set(
      sessions.map((s) => s.scheduled_time).filter((t): t is string => !!t)
    )
  ).sort();
  const rows = times.length > 0 ? times : ["--"];
  const map = new Map<string, Map<string, TeacherSession[]>>();
  for (const s of sessions) {
    const day = s.scheduled_weekday ?? "Unscheduled";
    const time = s.scheduled_time ?? "--";
    if (!map.has(day)) map.set(day, new Map());
    const row = map.get(day)!;
    if (!row.has(time)) row.set(time, []);
    row.get(time)!.push(s);
  }

  let html = `<div style="padding:20px;color:#fff;font-family:Arial,Helvetica,sans-serif;">`;
  html += `<h2 style="margin-bottom:12px;">My Timetable</h2>`;
  html += `<table style="width:100%;border-collapse:collapse;">
    <thead><tr><th style="padding:8px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.04);text-align:left">Time</th>`;
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
          html += `<div style="background:linear-gradient(90deg,#1e3a8a,#6d28d9);padding:8px;border-radius:8px;margin-bottom:8px;color:#fff">
            <div style="font-weight:600;margin-bottom:6px">${
              it.subject ?? "(No subject)"
            }</div>
            <div style="font-size:12px;opacity:0.9;margin-bottom:4px">${
              it.group?.level
                ? `Group ${it.group.level}`
                : it.teacher?.name ?? "Teacher -"
            }</div>
            <div style="font-size:12px;opacity:0.9">📍 ${
              it.room?.name ?? "Room -"
            }</div>
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

type TeacherSession = {
  id: number;
  subject: string | null;
  group: { id: number; level?: string } | null;
  specialization: string | null;
  room: { id: number; name?: string } | null;
  scheduled_weekday: string | null;
  scheduled_time: string | null;
  teacher: { id: number; name?: string } | null;
};

export default function TimetableView({ userId }: TimetableViewProps) {
  const [sessions, setSessions] = useState<TeacherSession[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/teacher/timetable?userId=${encodeURIComponent(userId)}`
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error ?? "Failed to load timetable");
          setSessions([]);
        } else {
          setSessions(data.sessions ?? []);
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
      <h3 className="text-xl font-semibold text-white mb-3">My Timetable</h3>
      <div className="p-4 bg-white/5 border border-white/20 rounded">
        {loading && <p className="text-sm text-gray-200">Loading...</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}

        {!loading && !error && sessions && sessions.length === 0 && (
          <p className="text-sm text-gray-200">No scheduled sessions found.</p>
        )}

        {!loading && !error && sessions && sessions.length > 0 && (
          <div>
            <div className="flex justify-end mb-3">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
                onClick={async () => {
                  try {
                    // Dynamically import heavy libs only when needed
                    const [{ default: html2canvas }, { jsPDF }] =
                      await Promise.all([
                        import("html2canvas"),
                        import("jspdf"),
                      ]);

                    // Create hidden container with printable HTML
                    const container = document.createElement("div");
                    container.style.position = "fixed";
                    container.style.left = "-9999px";
                    container.style.top = "0";
                    container.style.width = "1200px";
                    container.innerHTML = renderPrintableTimetable(sessions);
                    document.body.appendChild(container);

                    // Give browser a moment to apply styles/images/fonts
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

                    // Calculate image dimensions to fit width
                    const imgProps = pdf.getImageProperties(imgData);
                    const imgWidth = imgProps.width;
                    const imgHeight = imgProps.height;
                    const ratio = imgHeight / imgWidth;
                    const renderHeight = pdfWidth * ratio;
                    let remainingHeight = renderHeight;
                    let position = 0;

                    // If content fits on one page
                    if (renderHeight <= pdfHeight) {
                      pdf.addImage(
                        imgData,
                        "PNG",
                        0,
                        0,
                        pdfWidth,
                        renderHeight
                      );
                    } else {
                      // Add slices of the image across multiple pages
                      const pageCanvas = document.createElement("canvas");
                      pageCanvas.width = canvas.width;
                      pageCanvas.height = Math.floor(
                        (canvas.width * pdfHeight) / pdfWidth
                      );
                      const pageCtx = pageCanvas.getContext("2d")!;

                      while (remainingHeight > 0) {
                        // draw slice
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
                        pdf.addImage(
                          pageData,
                          "PNG",
                          0,
                          0,
                          pdfWidth,
                          pdfHeight
                        );
                        remainingHeight -= pdfHeight;
                        position += pageCanvas.height;
                        if (remainingHeight > 0) pdf.addPage();
                      }
                    }

                    // Trigger download
                    pdf.save("timetable.pdf");

                    // cleanup
                    document.body.removeChild(container);
                  } catch (err) {
                    // fallback to printable window if pdf generation fails
                    console.error("PDF generation failed", err);
                    const printable = document.createElement("div");
                    printable.innerHTML = renderPrintableTimetable(sessions);
                    const w = window.open(
                      "",
                      "_blank",
                      "noopener,noreferrer,width=900,height=700"
                    );
                    if (!w) return;
                    w.document.write(
                      `<!doctype html><html><head><meta charset="utf-8"><title>Timetable</title><style>
                      body{font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#0b1020; color:#fff;}
                      .table{width:100%;border-collapse:collapse}
                      .cell{border:1px solid rgba(255,255,255,0.06);padding:10px;vertical-align:top}
                      .header{background:rgba(255,255,255,0.04);font-weight:600}
                      .session{background:linear-gradient(90deg,#1e3a8a,#6d28d9);padding:8px;border-radius:6px}
                      </style></head><body>` +
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

            <div className="overflow-auto">
              <div className="min-w-[800px]">
                {renderTimetableGrid(sessions)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
