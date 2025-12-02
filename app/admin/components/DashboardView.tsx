"use client";

import { useEffect, useState } from "react";
import SessionsCRUD from "./SessionsCRUD";

interface DashboardViewProps {
  userName?: string | null;
  onNavigate?: (
    view:
      | "dashboard"
      | "generator"
      | "rooms"
      | "sessions"
      | "students"
      | "subjects"
      | "teachers"
      | "specializations"
      | "departments"
  ) => void;
}

export default function DashboardView({
  userName,
  onNavigate,
}: DashboardViewProps) {
  const [stats, setStats] = useState<{
    teachers?: number;
    students?: number;
    scheduledSessions?: number;
  }>({});

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data && !data.error) setStats(data);
      })
      .catch((err) => console.error("Failed to load admin stats", err));
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Welcome, {userName}</h2>
      </div>

      <style jsx>{`
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .nav-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 28px;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .nav-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 45px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.15);
        }
        .nav-card h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #fff;
          font-weight: 600;
        }
        .nav-card p {
          margin: 0;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          line-height: 1.5;
        }
        .nav-card .icon {
          font-size: 32px;
          margin-bottom: 12px;
        }
        .details-section {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .details-section h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
          color: #fff;
          font-weight: 600;
        }
        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 18px;
        }
        .detail-item {
          padding: 20px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          animation: fadeSlideIn 0.8s ease forwards;
          opacity: 0;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .detail-item:nth-child(1) {
          animation-delay: 0.1s;
        }
        .detail-item:nth-child(2) {
          animation-delay: 0.2s;
        }
        .detail-item:nth-child(3) {
          animation-delay: 0.3s;
        }
        .detail-item:nth-child(4) {
          animation-delay: 0.4s;
        }
        .detail-item h4 {
          margin: 0 0 6px 0;
          font-size: 15px;
          color: #fff;
          font-weight: 600;
        }
        .detail-item p {
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
        }
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          color: #fff;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
          background: rgba(255, 255, 255, 0.2);
        }
        .stat-card h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          opacity: 0.9;
          font-weight: 500;
        }
        .stat-card .count {
          font-size: 36px;
          font-weight: 700;
          margin: 0;
        }
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="cards">
        <button
          onClick={() => onNavigate?.("rooms")}
          className="nav-card text-left"
        >
          <div className="icon">🏫</div>
          <h3>Rooms</h3>
          <p>Manage classrooms, labs, and other facilities</p>
        </button>

        <button
          onClick={() => onNavigate?.("sessions")}
          className="nav-card text-left"
        >
          <div className="icon">📅</div>
          <h3>Sessions</h3>
          <p>Schedule and organize class sessions</p>
        </button>

        <button
          onClick={() => onNavigate?.("subjects")}
          className="nav-card text-left"
        >
          <div className="icon">📚</div>
          <h3>Subjects</h3>
          <p>Add and manage course subjects</p>
        </button>

        <button
          onClick={() => onNavigate?.("teachers")}
          className="nav-card text-left"
        >
          <div className="icon">👨‍🏫</div>
          <h3>Teachers</h3>
          <p>Manage teacher information and assignments</p>
        </button>

        <button
          onClick={() => onNavigate?.("students")}
          className="nav-card text-left"
        >
          <div className="icon">👨‍🎓</div>
          <h3>Students</h3>
          <p>Manage student records and enrollments</p>
        </button>

        <button
          onClick={() => onNavigate?.("generator")}
          className="nav-card text-left"
        >
          <div className="icon">⚙️</div>
          <h3>Generate Timetable</h3>
          <p>Create optimized schedules automatically</p>
        </button>
      </div>

      {/* System Features removed per request. */}

      <div className="stats-section">
        <div className="stat-card">
          <h4>Active Teachers</h4>
          <p className="count">
            {typeof stats.teachers === "number" ? stats.teachers : "—"}
          </p>
        </div>
        <div className="stat-card">
          <h4>Total Students</h4>
          <p className="count">
            {typeof stats.students === "number" ? stats.students : "—"}
          </p>
        </div>
        <div className="stat-card">
          <h4>Scheduled Sessions</h4>
          <p className="count">
            {typeof stats.scheduledSessions === "number"
              ? stats.scheduledSessions
              : "—"}
          </p>
        </div>
      </div>

      {/* Sessions CRUD section on dashboard */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Manage Sessions</h2>
        <div className="bg-white/10 rounded-2xl p-6 shadow-lg">
          <SessionsCRUD />
        </div>
      </div>
    </>
  );
}
