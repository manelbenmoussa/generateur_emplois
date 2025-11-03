'use client';

import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AdminHomePage() {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <>
      <style jsx>{`
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .nav-card {
          background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
          border-radius: var(--radius);
          padding: 28px;
          cursor: pointer;
          box-shadow: var(--shadow);
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
        }
        .nav-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 45px rgba(2, 6, 23, 0.45);
          border-color: var(--accent);
        }
        .nav-card h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #0b1220;
          font-weight: 600;
        }
        .nav-card p {
          margin: 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.5;
        }
        .nav-card .icon {
          font-size: 32px;
          margin-bottom: 12px;
        }
        .details-section {
          background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
          border-radius: var(--radius);
          padding: 32px;
          box-shadow: var(--shadow);
          margin-bottom: 30px;
        }
        .details-section h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
          color: #0b1220;
          font-weight: 600;
        }
        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 18px;
        }
        .detail-item {
          padding: 20px;
          background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
          border-radius: 10px;
          animation: fadeSlideIn 0.8s ease forwards;
          opacity: 0;
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
          color: #0284c7;
          font-weight: 600;
        }
        .detail-item p {
          margin: 0;
          color: #0b1220;
          font-size: 13px;
        }
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
        }
        .stat-card {
          background: linear-gradient(135deg, var(--accent) 0%, #6b4423 100%);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow);
          color: #fff;
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(2, 6, 23, 0.5);
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

      <AdminLayout title="Admin Dashboard" description="Manage your timetable system">
        <div className="cards">
          <div className="nav-card" onClick={() => navigateTo('/admin/rooms')}>
            <div className="icon">🏫</div>
            <h3>Rooms</h3>
            <p>Manage classrooms, labs, and other facilities</p>
          </div>

          <div className="nav-card" onClick={() => navigateTo('/admin/sessions')}>
            <div className="icon">📅</div>
            <h3>Sessions</h3>
            <p>Schedule and organize class sessions</p>
          </div>

          <div className="nav-card" onClick={() => navigateTo('/admin/subjects')}>
            <div className="icon">📚</div>
            <h3>Subjects</h3>
            <p>Add and manage course subjects</p>
          </div>

          <div className="nav-card" onClick={() => navigateTo('/admin/teachers')}>
            <div className="icon">👨‍🏫</div>
            <h3>Teachers</h3>
            <p>Manage teacher information and assignments</p>
          </div>

          <div className="nav-card" onClick={() => navigateTo('/admin/students')}>
            <div className="icon">👨‍🎓</div>
            <h3>Students</h3>
            <p>Manage student records and enrollments</p>
          </div>
        </div>

        <div className="details-section">
          <h3>Details Continuation</h3>
          <div className="details-grid">
            <div className="detail-item">
              <h4>Automated Scheduling</h4>
              <p>
                Our smart algorithm handles conflict-free timetable generation automatically
              </p>
            </div>
            <div className="detail-item">
              <h4>Real-time Updates</h4>
              <p>Changes to rooms or teachers are reflected instantly across all schedules</p>
            </div>
            <div className="detail-item">
              <h4>Resource Optimization</h4>
              <p>Maximize room utilization and minimize teacher idle time</p>
            </div>
            <div className="detail-item">
              <h4>Conflict Detection</h4>
              <p>Automatic validation prevents scheduling conflicts and overlaps</p>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-card">
            <h4>Active Teachers</h4>
            <p className="count">—</p>
          </div>
          <div className="stat-card">
            <h4>Total Students</h4>
            <p className="count">—</p>
          </div>
          <div className="stat-card">
            <h4>Scheduled Sessions</h4>
            <p className="count">—</p>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
