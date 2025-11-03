"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
  adminName?: string;
  adminRole?: string;
}

export default function AdminSidebar({
  adminName = "Admin Mohamed",
  adminRole = "Administrator",
}: SidebarProps) {
  const pathname = usePathname();
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === path || pathname?.startsWith(path + "/");

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <style jsx>{`
        .sidebar {
          width: 260px;
          background: linear-gradient(180deg, #0b1220, #071226 80%);
          border-radius: 12px;
          padding: 18px;
          color: #dbeafe;
          box-shadow: 0 10px 30px rgba(2, 6, 23, 0.35);
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex-shrink: 0;
          height: fit-content;
          position: sticky;
          top: 28px;
        }
        .brand {
          display: flex;
          gap: 12px;
          align-items: center;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          margin-bottom: 8px;
        }
        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: linear-gradient(135deg, #8b5e3c, #b27b53);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 16px;
        }
        .nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 6px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border-radius: 10px;
          color: #dbeafe;
          text-decoration: none;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .nav-item.active {
          background: rgba(139, 94, 60, 0.2);
          font-weight: 600;
        }
        .toggle-btn {
          margin-left: auto;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.04);
          padding: 6px;
          border-radius: 8px;
          color: #dbeafe;
          cursor: pointer;
          font-size: 12px;
        }
        .submenu {
          margin-left: 34px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 6px;
        }
        .submenu a {
          font-size: 13px;
          color: #cfe8ff;
          padding: 8px;
          border-radius: 8px;
          text-decoration: none;
        }
        .submenu a:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .submenu a.active {
          background: rgba(139, 94, 60, 0.15);
          font-weight: 600;
        }
        .spacer {
          flex: 1;
        }
        .profile-link {
          display: block;
          padding: 10px;
          border-radius: 10px;
          color: #dbeafe;
          text-decoration: none;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.01),
            transparent
          );
          border: 1px solid rgba(255, 255, 255, 0.02);
        }
        .profile-link:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        @media (max-width: 980px) {
          .sidebar {
            display: none;
          }
        }
      `}</style>

      <div className="brand">
        <div className="avatar">AD</div>
        <div>
          <h1 style={{ margin: 0, fontSize: "14px", color: "#e6eef8" }}>
            Admin
          </h1>
          <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>
            Timetable Generator
          </p>
        </div>
      </div>

      <nav className="nav" role="navigation" aria-label="Primary">
        <div>
          <div
            className="nav-item"
            onClick={() => setIsGeneratorOpen(!isGeneratorOpen)}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <span>Timetable Generator</span>
            <button className="toggle-btn" onClick={(e) => e.stopPropagation()}>
              {isGeneratorOpen ? "cacher" : "affiche"}
            </button>
          </div>

          {isGeneratorOpen && (
            <div className="submenu">
              <Link
                href="/admin/rooms"
                className={isActive("/admin/rooms") ? "active" : ""}
              >
                Rooms
              </Link>
              <Link
                href="/admin/sessions"
                className={isActive("/admin/sessions") ? "active" : ""}
              >
                Sessions
              </Link>
              <Link
                href="/admin/subjects"
                className={isActive("/admin/subjects") ? "active" : ""}
              >
                Subjects
              </Link>
            </div>
          )}
        </div>

        <Link
          href="/admin/teachers"
          className={`nav-item ${isActive("/admin/teachers") ? "active" : ""}`}
        >
          Manage Teachers
        </Link>

        <Link
          href="/admin/students"
          className={`nav-item ${isActive("/admin/students") ? "active" : ""}`}
        >
          Manage Students
        </Link>

        <div className="spacer" />

        <Link href="/admin/profile" className="profile-link">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "13px", color: "#e6eef8" }}>
              View profile
            </span>
            <small style={{ fontSize: "12px", color: "#94a3b8" }}>
              {adminName}
            </small>
          </div>
        </Link>
      </nav>
    </aside>
  );
}
