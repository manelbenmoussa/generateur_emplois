"use client";

import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function AdminLayout({
  children,
  title,
  description,
  actions,
}: AdminLayoutProps) {
  return (
    <div className="app">
      <style jsx global>{`
        :root {
          --bg: #071226;
          --accent: #8b5e3c;
          --muted: #64748b;
          --card: #ffffff;
          --radius: 12px;
          --shadow: 0 10px 30px rgba(2, 6, 23, 0.35);
        }
        html,
        body {
          height: 100%;
          margin: 0;
          background: linear-gradient(
            180deg,
            #071126 0%,
            #071126 60%,
            #071126 100%
          );
          color: #0b1220;
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto,
            Arial;
        }
        * {
          box-sizing: border-box;
        }
        .app {
          display: flex;
          min-height: 100vh;
          gap: 24px;
          padding: 28px;
        }
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .page-title h2 {
          margin: 0;
          font-size: 20px;
          color: #fff;
        }
        .page-title p {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
        }
        @media (max-width: 980px) {
          .app {
            padding: 16px;
          }
        }
      `}</style>

      <AdminSidebar />

      <main className="main" role="main">
        <div className="header">
          <div className="page-title">
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          {actions && <div className="controls">{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}
