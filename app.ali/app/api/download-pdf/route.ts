import { NextResponse } from "next/server";
import { generateAndFormatTimetable } from "../../../services/timetableService";
import { DAYS, TIME_SLOTS } from "../../../constants/schedule";

interface PdfSession {
  id: number | string;
  subject: string;
  teacher: string;
  group: string;
  specialization: string;
  room: string;
  dateTime: string;
}

export async function GET() {
  try {
    const schoolId = 1;
    const pdfPayload = await generateAndFormatTimetable(schoolId);

    // Group sessions by group
    const sessionsByGroup = new Map<string, PdfSession[]>();
    pdfPayload.sessions.forEach((session) => {
      const groupKey = `${session.group} - ${session.specialization}`;
      if (!sessionsByGroup.has(groupKey)) {
        sessionsByGroup.set(groupKey, []);
      }
      sessionsByGroup.get(groupKey)!.push(session);
    });

    // Generate HTML for PDF
    const html = generateTimetableHTML(pdfPayload.school.name, sessionsByGroup);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="timetable.html"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function generateTimetableHTML(
  schoolName: string,
  sessionsByGroup: Map<string, PdfSession[]>
): string {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Timetable - ${schoolName}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 9px;
      margin: 0;
      padding: 10px;
    }
    
    .no-print {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }
    
    .print-button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .print-button:hover {
      background: #1d4ed8;
    }
    
    @media print {
      .no-print {
        display: none !important;
      }
    }
    
    .page-break {
      page-break-after: always;
    }
    
    .header {
      text-align: center;
      margin-bottom: 15px;
    }
    
    .header h1 {
      margin: 5px 0;
      font-size: 16px;
      color: #1e40af;
    }
    
    .header h2 {
      margin: 5px 0;
      font-size: 14px;
      color: #1e3a8a;
      font-weight: bold;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      background: white;
    }
    
    th {
      background: #1e40af;
      color: white;
      padding: 8px 4px;
      border: 1px solid #333;
      font-weight: bold;
      font-size: 10px;
    }
    
    td {
      border: 1px solid #333;
      padding: 4px;
      vertical-align: top;
      min-height: 60px;
      height: 60px;
    }
    
    .time-column {
      width: 80px;
      background: #e0e7ff;
      font-weight: bold;
      text-align: center;
      font-size: 9px;
    }
    
    .session {
      background: #dbeafe;
      border: 1px solid #3b82f6;
      border-radius: 3px;
      padding: 3px;
      margin: 2px 0;
      font-size: 8px;
      line-height: 1.3;
    }
    
    .session-subject {
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 2px;
    }
    
    .session-teacher {
      color: #059669;
      margin-bottom: 1px;
    }
    
    .session-room {
      color: #dc2626;
      font-weight: bold;
    }
    
    .empty-cell {
      background: #f9fafb;
    }
    
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
  <script>
    function printTimetable() {
      window.print();
    }
  </script>
</head>
<body>
  <div class="no-print">
    <button class="print-button" onclick="printTimetable()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
        <path d="M6 14h12v8H6z"/>
      </svg>
      Print / Save as PDF
    </button>
  </div>
`;

  let groupIndex = 0;
  sessionsByGroup.forEach((sessions, groupName) => {
    if (groupIndex > 0) {
      html += '<div class="page-break"></div>\n';
    }

    html += `
  <div class="header">
    <h1>TimeTable for the group</h1>
    <h2>${groupName}</h2>
  </div>
  
  <table>
    <thead>
      <tr>
        <th class="time-column">TIME</th>`;

    DAYS.forEach((day) => {
      html += `<th>${day}</th>`;
    });

    html += `
      </tr>
    </thead>
    <tbody>`;

    // Create a map for quick lookup: day -> timeSlot -> sessions
    const scheduleGrid = new Map<string, Map<string, PdfSession[]>>();

    sessions.forEach((session) => {
      // Parse dateTime: "Monday 08:00 - 09:30"
      const parts = session.dateTime.split(" ");
      const day = parts[0];
      const startTime = parts[1];

      if (!scheduleGrid.has(day)) {
        scheduleGrid.set(day, new Map());
      }
      if (!scheduleGrid.get(day)!.has(startTime)) {
        scheduleGrid.get(day)!.set(startTime, []);
      }
      scheduleGrid.get(day)!.get(startTime)!.push(session);
    });

    // Generate rows for each time slot
    TIME_SLOTS.forEach((slot) => {
      html += `
      <tr>
        <td class="time-column">${slot.startTime}<br>${slot.endTime}</td>`;

      DAYS.forEach((day) => {
        const daySessions = scheduleGrid.get(day)?.get(slot.startTime);

        if (daySessions && daySessions.length > 0) {
          html += `<td>`;
          daySessions.forEach((session) => {
            html += `
            <div class="session">
              <div class="session-subject">${session.subject}</div>
              <div class="session-teacher">${session.teacher}</div>
              <div class="session-room">${session.room}</div>
            </div>`;
          });
          html += `</td>`;
        } else {
          html += `<td class="empty-cell"></td>`;
        }
      });

      html += `
      </tr>`;
    });

    html += `
    </tbody>
  </table>`;

    groupIndex++;
  });

  html += `
</body>
</html>`;

  return html;
}
